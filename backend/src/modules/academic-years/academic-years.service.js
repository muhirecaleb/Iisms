const db = require('../../config/database');

class AcademicYearService {
  async list() {
    const [rows] = await db.query(
      'SELECT *, DATE_FORMAT(start_date, "%Y-%m-%d") as start_date, DATE_FORMAT(end_date, "%Y-%m-%d") as end_date FROM academic_years ORDER BY year_id DESC'
    );
    return rows;
  }

  async create({ yearLabel, startDate, endDate }) {
    // Check for duplicate label
    const [[existing]] = await db.query(
      'SELECT year_id FROM academic_years WHERE year_label = ?', [yearLabel]
    );
    if (existing) {
      const err = new Error('Academic year label already exists');
      err.statusCode = 409;
      throw err;
    }

    const [result] = await db.query(
      'INSERT INTO academic_years (year_label, start_date, end_date, is_current) VALUES (?, ?, ?, FALSE)',
      [yearLabel, startDate || null, endDate || null]
    );
    return { yearId: result.insertId, yearLabel };
  }

  async setCurrent(yearId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('UPDATE academic_years SET is_current = FALSE');
      await connection.query('UPDATE academic_years SET is_current = TRUE WHERE year_id = ?', [yearId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return { yearId };
  }

  async ensureCurrentYear() {
    // Check if there's a current year
    const [[current]] = await db.query(
      'SELECT year_id, year_label FROM academic_years WHERE is_current = TRUE LIMIT 1'
    );
    if (current) return current;

    // No current year — create one
    const yearLabel = String(new Date().getFullYear());
    const [[existing]] = await db.query(
      'SELECT year_id FROM academic_years WHERE year_label = ?', [yearLabel]
    );
    if (existing) {
      // Year exists but isn't current — set it
      await db.query('UPDATE academic_years SET is_current = FALSE');
      await db.query('UPDATE academic_years SET is_current = TRUE WHERE year_id = ?', [existing.year_id]);
      return { year_id: existing.year_id, year_label: yearLabel };
    }

    // Create new year
    const [result] = await db.query(
      'INSERT INTO academic_years (year_label, start_date, end_date, is_current) VALUES (?, ?, ?, TRUE)',
      [yearLabel, `${yearLabel}-01-01`, `${yearLabel}-12-31`]
    );
    return { year_id: result.insertId, year_label: yearLabel };
  }

  async remove(yearId) {
    // Check if any students are enrolled
    const [[{ cnt }]] = await db.query(
      'SELECT COUNT(*) as cnt FROM student_academic_records WHERE academic_year_id = ?', [yearId]
    );
    if (cnt > 0) {
      const err = new Error(`Cannot delete: ${cnt} student(s) are enrolled in this year`);
      err.statusCode = 422;
      throw err;
    }

    // Check if it's the current year
    const [[current]] = await db.query(
      'SELECT is_current FROM academic_years WHERE year_id = ?', [yearId]
    );
    if (current && current.is_current) {
      const err = new Error('Cannot delete the current academic year');
      err.statusCode = 422;
      throw err;
    }

    await db.query('DELETE FROM academic_years WHERE year_id = ?', [yearId]);
    return { yearId };
  }
}

module.exports = new AcademicYearService();
