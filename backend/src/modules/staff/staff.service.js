const db = require('../../config/database');

class StaffService {
  async list({ page = 1, limit = 20, search, academicYearId, status, category }) {
    page = Number(page);
    limit = Number(limit);
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
    if (years.length) {
      await db.query('INSERT INTO staff_academic_years (staff_id, academic_year_id) VALUES (?, ?)', [staffId, years[0].year_id]);
    }
    return { staffId, staffNo };
  }

  async update(id, data, userId) {
    const fields = [];
    const params = []; 

    // Map camelCase API fields to snake_case DB columns
    const fieldMap = {
      fullName: 'full_name',
      dateOfBirth: 'date_of_birth',
      gender: 'gender',
      maritalStatus: 'marital_status',
      nationality: 'nationality',
      idPassportNo: 'id_passport_no',
      staffCategory: 'staff_category',
      phoneNumber: 'phone_number',
      email: 'email',
      highestQualification: 'highest_qualification',
      domain: 'domain',
      subDomain: 'sub_domain',
      fieldOfStudy: 'field_of_study',
      graduationDate: 'graduation_date',
      staffPosition: 'staff_position',
      employmentDateEducation: 'employment_date_education',
      employmentDateSchool: 'employment_date_school',
      contractType: 'contract_type',
      staffBank: 'staff_bank',
      accountNumber: 'account_number',
      staffRssbNumber: 'staff_rssb_number',
      province: 'province',
      district: 'district',
      sector: 'sector',
      cell: 'cell',
      village: 'village',
      detailAddress: 'detail_address',
      status: 'status',
      photoFileId: 'photo_file_id',
    };

    for (const [camelKey, dbCol] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined && data[camelKey] !== null) {
        fields.push(`${dbCol} = ?`);
        params.push(data[camelKey]);
      }
    }

    if (fields.length === 0) {
      return { id, message: 'No fields to update' };
    }

    params.push(id);
    await db.query(`UPDATE staff SET ${fields.join(', ')} WHERE staff_id = ? AND deleted_at IS NULL`, params);

    return { staffId: parseInt(id, 10) };
  }

  async delete(id, userId) {
    const [result] = await db.query(
      'UPDATE staff SET deleted_at = NOW() WHERE staff_id = ? AND deleted_at IS NULL',
      [id]
    );
    if (result.affectedRows === 0) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('Staff member not found or already removed');
    }
    return true;
  }

  async uploadPhoto(id, file, userId) {
    if (!file) {
      const { ValidationError } = require('../../utils/errors');
      throw new ValidationError([{ field: 'photo', message: 'No photo file provided' }]);
    }

    // Insert file metadata into file_uploads
    const [fileResult] = await db.query(
      `INSERT INTO file_uploads (original_name, storage_path, mime_type, file_size, entity_type, entity_id, uploaded_by)
       VALUES (?, ?, ?, ?, 'staff_photo', ?, ?)`,
      [file.originalname, file.path, file.mimetype, file.size, id, userId]
    );
    const fileId = fileResult.insertId;

    // Link photo to staff record
    await db.query(
      'UPDATE staff SET photo_file_id = ? WHERE staff_id = ? AND deleted_at IS NULL',
      [fileId, id]
    );

    return { photoFileId: fileId, photoPath: file.path };
  }
  async copyForward({ fromAcademicYearId, toAcademicYearId, staffIds }) {
    let copied = 0, exists = 0;
    for (const sid of staffIds) {
      try {
        await db.query('INSERT IGNORE INTO staff_academic_years (staff_id, academic_year_id) VALUES (?, ?)', [sid, toAcademicYearId]);
        const [check] = await db.query('SELECT ROW_COUNT() as affected');
        if (check[0].affected > 0) { copied++; } else { exists++; }
      } catch { exists++; }
    }
    return { copied, alreadyExists: exists };
  }
}

module.exports = new StaffService();
