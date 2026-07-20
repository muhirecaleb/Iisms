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
    let query = `SELECT i.*, s.first_name, s.last_name, s.admission_no FROM invoices i JOIN students s ON i.student_id = s.student_id WHERE i.academic_year_id = ?`;
    const params = [academicYearId];
    if (termId) { query += ' AND i.term_id = ?'; params.push(termId); }
    if (status) { query += ' AND i.status = ?'; params.push(status); }
    const [rows] = await db.query(query + ' ORDER BY i.created_at DESC', params);
    return { data: rows, pagination: { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) } };
  }

  async generateInvoices({ academicYearId, termId, feeItemId }) {
    return { generated: 0, skipped: 0, errors: 0 };
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
