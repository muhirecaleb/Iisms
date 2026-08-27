const db = require('../../config/database');

class FinanceService {
  async dashboard(yearId) {
    const yearCond = yearId ? 'AND sar.academic_year_id = ?' : '';
    const yearCondInv = yearId ? 'AND academic_year_id = ?' : '';
    const yearCondPay = yearId ? 'AND i.academic_year_id = ?' : '';
    const params = yearId ? [yearId] : [];
    const paramsInv = yearId ? [yearId] : [];
    const paramsPay = yearId ? [yearId] : [];

    const [[{ totalStudents }]] = await db.query(
      `SELECT CAST(COUNT(DISTINCT s.student_id) AS UNSIGNED) as totalStudents
       FROM students s
       JOIN student_academic_records sar ON s.student_id = sar.student_id
       WHERE s.deleted_at IS NULL ${yearCond}`,
      params
    );

    const [[ invoicing ]] = await db.query(
      `SELECT
        CAST(COALESCE(SUM(CASE WHEN status != 'void' THEN amount_due ELSE 0 END), 0) AS UNSIGNED) as totalInvoiced
       FROM invoices WHERE 1=1 ${yearCondInv}`,
      paramsInv
    );

    const [[ collecting ]] = await db.query(
      `SELECT CAST(COALESCE(SUM(p.amount), 0) AS UNSIGNED) as totalCollected
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.invoice_id
       WHERE 1=1 ${yearCondPay}`,
      paramsPay
    );

    const kpi = {
      totalStudents,
      totalInvoiced: invoicing.totalInvoiced,
      totalCollected: collecting.totalCollected,
    };
    return {
      kpis: {
        ...kpi,
        outstanding: kpi.totalInvoiced - kpi.totalCollected,
        collectionRate: kpi.totalInvoiced > 0 ? ((kpi.totalCollected / kpi.totalInvoiced) * 100).toFixed(1) : 0,
      },
      recentPayments: [],
    };
  }

  async listFeeItems() {
    const [items] = await db.query('SELECT fee_item_id, item_name, description FROM fee_items ORDER BY fee_item_id');
    if (items.length === 0) {
      await db.query(
        "INSERT IGNORE INTO fee_items (fee_item_id, item_name, description) VALUES (1, 'Tuition Fee', 'Per-term tuition'), (2, 'Exam Fee', 'Examination fee'), (3, 'Laboratory Fee', 'Lab and practical fee'), (4, 'Sports Fee', 'Sports and activities fee'), (5, 'Library Fee', 'Library access fee')"
      );
      const [seeded] = await db.query('SELECT fee_item_id, item_name, description FROM fee_items ORDER BY fee_item_id');
      return seeded;
    }
    return items;
  }

  async getFeeStructure(yearId) {
    const yearCond = yearId ? 'AND fs.academic_year_id = ?' : '';
    const params = yearId ? [yearId] : [];
    const [rates] = await db.query(
      `SELECT fs.*, fi.item_name, t.term_name FROM fee_structures fs
       JOIN fee_items fi ON fs.fee_item_id = fi.fee_item_id
       JOIN terms t ON fs.term_id = t.term_id
       WHERE 1=1 ${yearCond}`,
      params
    );
    return { rates };
  }

  async upsertFeeRate(data) {
    const [[item]] = await db.query('SELECT fee_item_id FROM fee_items WHERE fee_item_id = ?', [data.feeItemId]);
    if (!item) {
      await db.query(
        'INSERT IGNORE INTO fee_items (fee_item_id, item_name, description) VALUES (?, ?, ?)',
        [data.feeItemId, 'Tuition Fee', 'Per-term tuition']
      );
    }
    const [[term]] = await db.query('SELECT term_id FROM terms WHERE term_id = ? AND academic_year_id = ?', [data.termId, data.academicYearId]);
    if (!term) {
      const err = new Error('Term not found for the current academic year.');
      err.statusCode = 404;
      throw err;
    }
    await db.query(
      `INSERT INTO fee_structures (academic_year_id, level, term_id, fee_item_id, amount)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [data.academicYearId, data.level, data.termId, data.feeItemId, data.amount]
    );
  }

  async listAcademicYears() {
    const [rows] = await db.query('SELECT year_id, year_label, is_current FROM academic_years ORDER BY year_id DESC');
    return rows;
  }

  async listInvoices({ page = 1, limit = 20, academicYearId, termId, status, search }) {
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;
    let query = `FROM invoices i
      JOIN students s ON i.student_id = s.student_id
      LEFT JOIN student_academic_records sar ON s.student_id = sar.student_id AND sar.academic_year_id = i.academic_year_id
      LEFT JOIN classes c ON sar.class_id = c.class_id
      WHERE 1=1`;
    const params = [];
    if (academicYearId) { query += ' AND i.academic_year_id = ?'; params.push(academicYearId); }
    if (termId) { query += ' AND i.term_id = ?'; params.push(termId); }
    if (status) { query += ' AND i.status = ?'; params.push(status); }
    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ? OR c.class_name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const [countResult] = await db.query(`SELECT COUNT(*) as total ${query}`, params);
    const total = countResult[0].total;

    const [rows] = await db.query(
      `SELECT i.*, s.first_name, s.last_name, s.admission_no, c.class_name, c.level
       ${query} ORDER BY c.class_name ASC, s.last_name ASC, s.first_name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async generateInvoices({ academicYearId, termId, feeItemId }, userId) {
    // Resolve academic year — use provided or fall back to current
    let yearId = academicYearId;
    if (!yearId) {
      const [[current]] = await db.query('SELECT year_id FROM academic_years WHERE is_current = TRUE LIMIT 1');
      yearId = current?.year_id;
    }
    if (!yearId) {
      const err = new Error('No academic year set. Please set a current academic year first.');
      err.statusCode = 400;
      throw err;
    }

    // Try to find fee rates for this year; if none, try any year
    let [feeRates] = await db.query(
      `SELECT level, amount FROM fee_structures WHERE academic_year_id = ? AND term_id = ? AND fee_item_id = ?`,
      [yearId, termId, feeItemId]
    );

    if (feeRates.length === 0) {
      // Fallback: get rates from any year
      [feeRates] = await db.query(
        `SELECT level, amount FROM fee_structures WHERE term_id = ? AND fee_item_id = ? LIMIT 100`,
        [termId, feeItemId]
      );
    }

    if (feeRates.length === 0) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('No fee rate configured. Please add fee rates under Fee Structure first.');
    }

    const rateMap = {};
    for (const r of feeRates) {
      rateMap[r.level] = parseFloat(r.amount);
    }

    // Get students enrolled this year (or any year as fallback)
    let [students] = await db.query(
      `SELECT s.student_id, c.level, c.class_name
       FROM students s
       JOIN student_academic_records sar ON s.student_id = sar.student_id
       JOIN classes c ON sar.class_id = c.class_id
       WHERE sar.academic_year_id = ? AND s.deleted_at IS NULL AND s.status = 'active'`,
      [yearId]
    );

    if (students.length === 0) {
      // Fallback: get students from any year
      [students] = await db.query(
        `SELECT s.student_id, c.level, c.class_name
         FROM students s
         JOIN student_academic_records sar ON s.student_id = sar.student_id
         JOIN classes c ON sar.class_id = c.class_id
         WHERE s.deleted_at IS NULL AND s.status = 'active'`
      );
    }

    const [existing] = await db.query(
      `SELECT student_id FROM invoices
       WHERE academic_year_id = ? AND term_id = ? AND fee_item_id = ? AND status != 'void'`,
      [yearId, termId, feeItemId]
    );
    const existingStudentIds = new Set(existing.map((i) => i.student_id));

    const [sponsorships] = await db.query(
      `SELECT student_id, coverage_percent FROM student_sponsorships WHERE academic_year_id = ?`,
      [yearId]
    );
    const sponsorshipMap = {};
    for (const sp of sponsorships) {
      sponsorshipMap[sp.student_id] = parseFloat(sp.coverage_percent);
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let generated = 0;
      let skipped = 0;
      let errors = 0;
      const errorDetails = [];

      for (const student of students) {
        if (existingStudentIds.has(student.student_id)) {
          skipped++;
          continue;
        }

        const grossAmount = rateMap[student.level];
        if (!grossAmount) {
          skipped++;
          continue;
        }

        const discountPercent = sponsorshipMap[student.student_id] || 0;
        const amountDue = grossAmount - (grossAmount * discountPercent / 100);

        try {
          await connection.query(
            `INSERT INTO invoices (student_id, academic_year_id, term_id, fee_item_id, invoice_date, gross_amount, discount_percent, amount_due, status, created_by)
             VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, 'open', ?)`,
            [student.student_id, yearId, termId, feeItemId, grossAmount, discountPercent, amountDue, userId]
          );
          generated++;
        } catch (err) {
          errors++;
          errorDetails.push({ studentId: student.student_id, error: err.message });
        }
      }

      await connection.commit();
      return { generated, skipped, errors, ...(errors > 0 && { errorDetails }) };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getInvoiceDetail(id) {
    const [rows] = await db.query(
      `SELECT i.*, s.first_name, s.last_name, s.admission_no FROM invoices i JOIN students s ON i.student_id = s.student_id WHERE i.invoice_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async recordPayment(data, userId) {
    const [inv] = await db.query('SELECT amount_due, status FROM invoices WHERE invoice_id = ?', [data.invoiceId]);
    if (!inv.length) throw new (require('../../utils/errors').NotFoundError)('Invoice not found');
    if (inv[0].status === 'paid' || inv[0].status === 'void') {
      const err = new Error(`Cannot pay an invoice with status: ${inv[0].status}`);
      err.statusCode = 422;
      throw err;
    }
    const [existing] = await db.query('SELECT COUNT(*) as cnt FROM payments WHERE invoice_id = ?', [data.invoiceId]);
    const installmentNo = existing[0].cnt + 1;
    if (installmentNo > 3) throw new (require('../../utils/errors').AppError)('Max 3 installments per invoice', 422, 'BUSINESS_RULE');
    const [result] = await db.query(
      `INSERT INTO payments (invoice_id, student_id, installment_no, amount, payment_date, payment_method, reference_no, received_by, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.invoiceId, data.studentId, installmentNo, data.amount, data.paymentDate, data.paymentMethod, data.referenceNo, userId, data.comment]
    );

    // Calculate total paid and update invoice status
    const [[{ totalPaid }]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as totalPaid FROM payments WHERE invoice_id = ?',
      [data.invoiceId]
    );
    const newStatus = Number(totalPaid) >= Number(inv[0].amount_due) ? 'paid' : 'partially_paid';
    await db.query('UPDATE invoices SET status = ? WHERE invoice_id = ?', [newStatus, data.invoiceId]);

    return { paymentId: result.insertId, installmentNo, invoiceStatus: newStatus };
  }

  async listSponsorships(yearId) {
    const yearCond = yearId ? 'AND ss.academic_year_id = ?' : '';
    const params = yearId ? [yearId] : [];
    const [rows] = await db.query(
      `SELECT ss.*, s.first_name, s.last_name, s.admission_no, s.gender,
             c.class_name, c.level
       FROM student_sponsorships ss
       JOIN students s ON ss.student_id = s.student_id
       LEFT JOIN student_academic_records sar ON s.student_id = sar.student_id AND sar.academic_year_id = ss.academic_year_id
       LEFT JOIN classes c ON sar.class_id = c.class_id
       WHERE 1=1 ${yearCond}`,
      params
    );
    return rows;
  }

  async upsertSponsorship(data, userId) {
    await db.query(
      `INSERT INTO student_sponsorships (student_id, academic_year_id, sponsor_name, coverage_percent, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE sponsor_name = VALUES(sponsor_name), coverage_percent = VALUES(coverage_percent), notes = VALUES(notes)`,
      [data.studentId, data.academicYearId, data.sponsorName, data.coveragePercent, data.notes, userId]
    );
    return { studentId: data.studentId };
  }

  async deleteSponsorship(id) { await db.query('DELETE FROM student_sponsorships WHERE sponsorship_id = ?', [id]); }

  async getReports({ academicYearId, type }) { return { reportType: type, data: [] }; }

  async getStudentStatement(studentId, { scope = 'year', academicYearId, termId }) { return { studentId, scope, records: [] }; }

  async searchStudent(q, yearId) {
    let query = `
      SELECT s.student_id, s.admission_no, s.first_name, s.last_name, s.gender, s.status,
             c.class_name, c.level, c.trade
      FROM students s
      JOIN student_academic_records sar ON s.student_id = sar.student_id
      JOIN classes c ON sar.class_id = c.class_id
      WHERE s.deleted_at IS NULL`;
    const params = [];

    if (yearId) {
      query += ' AND sar.academic_year_id = ?';
      params.push(yearId);
    }

    query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);

    query += ' ORDER BY s.first_name, s.last_name LIMIT 20';

    const [rows] = await db.query(query, params);
    return rows;
  }

  async seedFinanceData(yearId) {
    const results = { feeItems: 0, feeRates: 0, terms: 0, sponsorships: 0 };

    // Resolve year
    let resolvedYearId = yearId;
    if (!resolvedYearId) {
      const [[current]] = await db.query('SELECT year_id FROM academic_years WHERE is_current = TRUE LIMIT 1');
      resolvedYearId = current?.year_id;
    }
    if (!resolvedYearId) {
      // Create a current year
      const yearLabel = String(new Date().getFullYear());
      const [r] = await db.query(
        'INSERT INTO academic_years (year_label, start_date, end_date, is_current) VALUES (?, ?, ?, TRUE)',
        [yearLabel, `${yearLabel}-01-01`, `${yearLabel}-12-31`]
      );
      resolvedYearId = r.insertId;
    }

    // 1. Seed fee_items
    const feeItemsData = [
      ['Tuition Fee', 'Per-term tuition fee'],
      ['Exam Fee', 'Examination fee'],
      ['Laboratory Fee', 'Lab and practical fee'],
      ['Sports Fee', 'Sports and activities fee'],
      ['Library Fee', 'Library access fee'],
      ['Development Fee', 'School development levy'],
    ];
    for (const [name, desc] of feeItemsData) {
      const [r] = await db.query('INSERT IGNORE INTO fee_items (item_name, description) VALUES (?, ?)', [name, desc]);
      results.feeItems += r.affectedRows;
    }

    // 2. Ensure terms exist for this year
    let [terms] = await db.query('SELECT term_id, term_name FROM terms WHERE academic_year_id = ?', [resolvedYearId]);
    if (terms.length === 0) {
      const termData = [
        ['Term 1', '2026-01-15', '2026-04-30'],
        ['Term 2', '2026-05-15', '2026-08-30'],
        ['Term 3', '2026-09-15', '2026-12-15'],
      ];
      for (const [name, start, end] of termData) {
        await db.query('INSERT INTO terms (academic_year_id, term_name, start_date, end_date) VALUES (?, ?, ?, ?)', [resolvedYearId, name, start, end]);
        results.terms++;
      }
      [terms] = await db.query('SELECT term_id, term_name FROM terms WHERE academic_year_id = ?', [resolvedYearId]);
    }

    // 3. Get tuition fee item id
    const [[tuitionItem]] = await db.query("SELECT fee_item_id FROM fee_items WHERE item_name = 'Tuition Fee'");
    if (!tuitionItem) throw new Error('Failed to create fee items');

    // 4. Seed fee_structures (INTANGO TSS actual fees)
    // Levels: L2 (short courses), L3-L5 (3-year Software Development)
    const termFees = { 'Term 1': 365000, 'Term 2': 330000, 'Term 3': 290000 };
    const levels = ['L2', 'L3', 'L4', 'L5'];
    for (const term of terms) {
      const amount = termFees[term.term_name] || 330000;
      for (const level of levels) {
        // L2 gets a reduced rate (short course)
        const levelAmount = level === 'L2' ? 167000 : amount;
        const [r] = await db.query(
          `INSERT INTO fee_structures (academic_year_id, level, term_id, fee_item_id, amount)
           VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
          [resolvedYearId, level, term.term_id, tuitionItem.fee_item_id, levelAmount]
        );
        results.feeRates += r.affectedRows;
      }
    }

    // 5. Seed sponsorships
    const [students] = await db.query(
      `SELECT s.student_id, s.first_name FROM students s
       JOIN student_academic_records sar ON s.student_id = sar.student_id
       WHERE sar.academic_year_id = ? AND s.deleted_at IS NULL LIMIT 4`,
      [resolvedYearId]
    );
    const sponsors = [
      { name: 'Church Germany', coverage: 90 },
      { name: 'Government of Rwanda', coverage: 75 },
      { name: 'UNICEF', coverage: 60 },
      { name: 'Parent Fund', coverage: 50 },
    ];
    for (let i = 0; i < students.length && i < sponsors.length; i++) {
      const [r] = await db.query(
        `INSERT INTO student_sponsorships (student_id, academic_year_id, sponsor_name, coverage_percent, notes)
         VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE sponsor_name = VALUES(sponsor_name), coverage_percent = VALUES(coverage_percent)`,
        [students[i].student_id, resolvedYearId, sponsors[i].name, sponsors[i].coverage, `Auto-seeded for ${students[i].first_name}`]
      );
      results.sponsorships += r.affectedRows;
    }

    return results;
  }
}

module.exports = new FinanceService();
