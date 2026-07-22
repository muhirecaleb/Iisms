const db = require('../../config/database');

class FinanceService {
  async dashboard(yearId) {
    const [kpis] = await db.query(
      `SELECT COUNT(*) as totalStudents,
        COALESCE(SUM(CASE WHEN i.status != 'void' THEN i.amount_due ELSE 0 END), 0) as totalInvoiced,
        COALESCE((SELECT SUM(p.amount) FROM payments p JOIN invoices i2 ON p.invoice_id = i2.invoice_id WHERE i2.academic_year_id = ?), 0) as totalCollected
       FROM students s
       JOIN student_academic_records sar ON s.student_id = sar.student_id
       WHERE sar.academic_year_id = ? AND s.deleted_at IS NULL`,
      [yearId, yearId]
    );
    const kpi = kpis[0];
    return {
      kpis: {
        totalStudents: kpi.totalStudents,
        totalInvoiced: kpi.totalInvoiced,
        totalCollected: kpi.totalCollected,
        outstanding: kpi.totalInvoiced - kpi.totalCollected,
        collectionRate: kpi.totalInvoiced > 0 ? ((kpi.totalCollected / kpi.totalInvoiced) * 100).toFixed(1) : 0,
      },
      recentPayments: [],
    };
  }

  async getFeeStructure(yearId) {
    const [rates] = await db.query(
      `SELECT fs.*, fi.item_name, t.term_name FROM fee_structures fs
       JOIN fee_items fi ON fs.fee_item_id = fi.fee_item_id
       JOIN terms t ON fs.term_id = t.term_id
       WHERE fs.academic_year_id = ?`,
      [yearId]
    );
    return { rates };
  }

  async upsertFeeRate(data) {
    await db.query(
      `INSERT INTO fee_structures (academic_year_id, level, term_id, fee_item_id, amount)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [data.academicYearId, data.level, data.termId, data.feeItemId, data.amount]
    );
  }

  async listInvoices({ page = 1, limit = 20, academicYearId, termId, status }) {
    const offset = (page - 1) * limit;
    let query = `FROM invoices i JOIN students s ON i.student_id = s.student_id WHERE i.academic_year_id = ?`;
    const params = [academicYearId];

    if (termId) { query += ' AND i.term_id = ?'; params.push(termId); }
    if (status) { query += ' AND i.status = ?'; params.push(status); }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total ${query}`, params
    );
    const total = countResult[0].total;

    // Get page data
    const [rows] = await db.query(
      `SELECT i.*, s.first_name, s.last_name, s.admission_no ${query} ORDER BY i.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async generateInvoices({ academicYearId, termId, feeItemId }, userId) {
    // 1. Get fee rates for this fee item across all levels
    const [feeRates] = await db.query(
      `SELECT level, amount FROM fee_structures
       WHERE academic_year_id = ? AND term_id = ? AND fee_item_id = ?`,
      [academicYearId, termId, feeItemId]
    );

    if (feeRates.length === 0) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('No fee rate configured for this item, term, and year combination');
    }

    // Map level → amount for quick lookup
    const rateMap = {};
    for (const r of feeRates) {
      rateMap[r.level] = parseFloat(r.amount);
    }

    // 2. Get all active students enrolled this year with their class level
    const [students] = await db.query(
      `SELECT s.student_id, c.level, c.class_name
       FROM students s
       JOIN student_academic_records sar ON s.student_id = sar.student_id
       JOIN classes c ON sar.class_id = c.class_id
       WHERE sar.academic_year_id = ? AND s.deleted_at IS NULL AND s.status = 'active'`,
      [academicYearId]
    );

    // 3. Get existing invoices to detect duplicates (skip voided ones)
    const [existing] = await db.query(
      `SELECT student_id FROM invoices
       WHERE academic_year_id = ? AND term_id = ? AND fee_item_id = ? AND status != 'void'`,
      [academicYearId, termId, feeItemId]
    );
    const existingStudentIds = new Set(existing.map((i) => i.student_id));

    // 4. Get sponsorships for potential discounts
    const [sponsorships] = await db.query(
      `SELECT student_id, coverage_percent FROM student_sponsorships
       WHERE academic_year_id = ?`,
      [academicYearId]
    );
    const sponsorshipMap = {};
    for (const sp of sponsorships) {
      sponsorshipMap[sp.student_id] = parseFloat(sp.coverage_percent);
    }

    // 5. Batch generate invoices in a transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      let generated = 0;
      let skipped = 0;
      let errors = 0;
      const errorDetails = [];

      for (const student of students) {
        // Skip if invoice already exists
        if (existingStudentIds.has(student.student_id)) {
          skipped++;
          continue;
        }

        // Skip if no fee rate configured for this level
        const grossAmount = rateMap[student.level];
        if (!grossAmount) {
          skipped++;
          continue;
        }

        // Apply sponsorship discount if applicable
        const discountPercent = sponsorshipMap[student.student_id] || 0;
        const amountDue = grossAmount - (grossAmount * discountPercent / 100);

        try {
          await connection.query(
            `INSERT INTO invoices (student_id, academic_year_id, term_id, fee_item_id, invoice_date, gross_amount, discount_percent, amount_due, status, created_by)
             VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, 'open', ?)`,
            [student.student_id, academicYearId, termId, feeItemId, grossAmount, discountPercent, amountDue, userId]
          );
          generated++;
        } catch (err) {
          errors++;
          errorDetails.push({ studentId: student.student_id, error: err.message });
        }
      }

      await connection.commit();

      return {
        generated,
        skipped,
        errors,
        ...(errors > 0 && { errorDetails }),
      };
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
    const [existing] = await db.query('SELECT COUNT(*) as cnt FROM payments WHERE invoice_id = ?', [data.invoiceId]);
    const installmentNo = existing[0].cnt + 1;
    if (installmentNo > 3) throw new (require('../../utils/errors').AppError)('Max 3 installments per invoice', 422, 'BUSINESS_RULE');
    const [result] = await db.query(
      `INSERT INTO payments (invoice_id, student_id, installment_no, amount, payment_date, payment_method, reference_no, received_by, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.invoiceId, data.studentId, installmentNo, data.amount, data.paymentDate, data.paymentMethod, data.referenceNo, userId, data.comment]
    );
    return { paymentId: result.insertId, installmentNo, invoiceStatus: 'partially_paid' };
  }

  async listSponsorships(yearId) {
    const [rows] = await db.query(
      `SELECT ss.*, s.first_name, s.last_name, s.admission_no FROM student_sponsorships ss JOIN students s ON ss.student_id = s.student_id WHERE ss.academic_year_id = ?`,
      [yearId]
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

  async searchStudent(q) {
    const [rows] = await db.query(
      "SELECT student_id, admission_no, first_name, last_name FROM students WHERE CONCAT(first_name, ' ', last_name) LIKE ? OR admission_no LIKE ? LIMIT 20",
      [`%${q}%`, `%${q}%`]
    );
    return rows;
  }
}

module.exports = new FinanceService();
