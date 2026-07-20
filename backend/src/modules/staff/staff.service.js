const db = require('../../config/database');

class StaffService {
  async list({ page = 1, limit = 20, search, academicYearId, status, category }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT s.* FROM staff s
      JOIN staff_academic_years say ON s.staff_id = say.staff_id
      WHERE say.academic_year_id = ? AND s.deleted_at IS NULL
    `;
    const params = [academicYearId];
    if (search) {
      query += ' AND (s.full_name LIKE ? OR s.staff_no LIKE ? OR s.phone_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { query += ' AND s.status = ?'; params.push(status); }
    if (category) { query += ' AND s.staff_category = ?'; params.push(category); }

    const [countResult] = await db.query(
      query.replace('SELECT s.*', 'SELECT COUNT(*) as total'), params
    );
    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(query, params);
    return { data: rows, pagination: { page, limit, total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / limit) } };
  }

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM staff WHERE staff_id = ? AND deleted_at IS NULL', [id]);
    if (!rows.length) { const { NotFoundError } = require('../../utils/errors'); throw new NotFoundError('Staff not found'); }
    return rows[0];
  }

  async create(data, userId) {
    const year = new Date().getFullYear();
    const [seq] = await db.query("SELECT COALESCE(MAX(CAST(SUBSTRING(staff_no, -3) AS UNSIGNED)), 0) + 1 as n FROM staff WHERE staff_no LIKE ?", [`STF-${String(year).slice(-2)}-%`]);
    const staffNo = `STF-${String(year).slice(-2)}-${String(seq[0].n).padStart(3, '0')}`;
    const [result] = await db.query(
      `INSERT INTO staff (staff_no, full_name, date_of_birth, gender, marital_status, nationality, id_passport_no, staff_category, phone_number, email, highest_qualification, domain, sub_domain, field_of_study, staff_position, contract_type, province, district, sector, cell, village, detail_address, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [staffNo, data.fullName, data.dateOfBirth, data.gender, data.maritalStatus, data.nationality || 'Rwandan', data.idPassportNo, data.staffCategory, data.phoneNumber, data.email, data.highestQualification, data.domain, data.subDomain, data.fieldOfStudy, data.staffPosition, data.contractType, data.province, data.district, data.sector, data.cell, data.village, data.detailAddress, userId]
    );
    const staffId = result.insertId;
    // Enroll in current academic year
    const [years] = await db.query('SELECT year_id FROM academic_years WHERE is_current = 1 LIMIT 1');
    if (years.length) await db.query('INSERT INTO staff_academic_years (staff_id, academic_year_id) VALUES (?, ?)', [staffId, years[0].year_id]);
    return { staffId, staffNo };
  }

  async update(id, data, userId) { return { id, ...data }; }
  async delete(id, userId) { return true; }
  async uploadPhoto(id, file, userId) { return { photoPath: file?.path }; }
  async copyForward({ fromAcademicYearId, toAcademicYearId, staffIds }) {
    let copied = 0, exists = 0;
    for (const sid of staffIds) {
      try {
        await db.query('INSERT IGNORE INTO staff_academic_years (staff_id, academic_year_id) VALUES (?, ?)', [sid, toAcademicYearId]);
        const [check] = await db.query('SELECT ROW_COUNT() as affected');
        if (check[0].affected > 0) copied++; else exists++;
      } catch { exists++; }
    }
    return { copied, alreadyExists: exists };
  }
}

module.exports = new StaffService();
