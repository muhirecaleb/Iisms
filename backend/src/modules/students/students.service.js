const db = require('../../config/database');

class StudentService {
  async list({ page = 1, limit = 20, search, academicYearId, gender, status, level, trade, sortBy = 'created_at', sortOrder = 'desc' }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT s.*, c.class_name, c.level, c.trade, sar.boarding_category, sar.sponsorship_type
      FROM students s
      JOIN student_academic_records sar ON s.student_id = sar.student_id
      JOIN classes c ON sar.class_id = c.class_id
      WHERE sar.academic_year_id = ? AND s.deleted_at IS NULL
    `;
    const params = [academicYearId];

    if (search) {
      query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (gender) { query += ' AND s.gender = ?'; params.push(gender); }
    if (status) { query += ' AND s.status = ?'; params.push(status); }
    if (level) { query += ' AND c.level = ?'; params.push(level); }
    if (trade) { query += ' AND c.trade = ?'; params.push(trade); }

    const [countResult] = await db.query(
      query.replace('SELECT s.*, c.class_name, c.level, c.trade, sar.boarding_category, sar.sponsorship_type', 'SELECT COUNT(*) as total'),
      params
    );
    const total = countResult[0].total;

    query += ` ORDER BY s.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return { data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const [rows] = await db.query(
      `SELECT s.*, json_arrayagg(json_object(
        'yearId', ay.year_id, 'yearLabel', ay.year_label,
        'className', c.class_name, 'level', c.level, 'trade', c.trade,
        'boardingCategory', sar.boarding_category, 'sponsorshipType', sar.sponsorship_type
      )) as academicRecords
      FROM students s
      LEFT JOIN student_academic_records sar ON s.student_id = sar.student_id
      LEFT JOIN academic_years ay ON sar.academic_year_id = ay.year_id
      LEFT JOIN classes c ON sar.class_id = c.class_id
      WHERE s.student_id = ? AND s.deleted_at IS NULL
      GROUP BY s.student_id`,
      [id]
    );
    if (rows.length === 0) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('Student not found');
    }
    return rows[0];
  }

  async create(data, userId) {
    // Transactional: student + academic record + contacts
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Generate admission number
      const year = new Date().getFullYear();
      const [seq] = await connection.query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING(admission_no, -3) AS UNSIGNED)), 0) + 1 as next_seq FROM students WHERE admission_no LIKE ?",
        [`INT-${String(year).slice(-2)}-%`]
      );
      const admissionNo = `INT-${String(year).slice(-2)}-${String(seq[0].next_seq).padStart(3, '0')}`;

      const [studentResult] = await connection.query(
        `INSERT INTO students (admission_no, first_name, last_name, gender, date_of_birth, nationality, residence_status, disability, parenthood, father_name, mother_name, email, phone, official_paper_type, official_paper_no, province, district, sector, cell, village, detail_address, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        [admissionNo, data.firstName, data.lastName, data.gender, data.dateOfBirth,
         data.nationality || 'Rwandan', data.residenceStatus || 'Resident', data.disability || 'None',
         data.parenthood, data.fatherName, data.motherName, data.email, data.phone,
         data.officialPaperType, data.officialPaperNo, data.province, data.district,
         data.sector, data.cell, data.village, data.detailAddress, userId]
      );
      const studentId = studentResult.insertId;

      await connection.query(
        `INSERT INTO student_academic_records (student_id, academic_year_id, class_id, term_id, boarding_category, sponsorship_type, gor_funded)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, data.academicYearId, data.classId, data.termId,
         data.boardingCategory || 'Day', data.sponsorshipType, data.gorFunded || false]
      );

      if (data.contacts && data.contacts.length > 0) {
        for (const contact of data.contacts) {
          await connection.query(
            `INSERT INTO student_contacts (student_id, relationship, contact_name, id_number, phone_number, email, is_primary, is_guardian)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentId, contact.relationship, contact.contactName, contact.idNumber,
             contact.phoneNumber, contact.email, contact.isPrimary || false, contact.isGuardian || false]
          );
        }
      }

      await connection.commit();
      return { studentId, admissionNo };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id, data, userId) { return { id, ...data }; }
  async delete(id, userId) { return true; }
  async promote(data, userId) { return { promoted: 0, skipped: 0 }; }
  async exportCsv({ academicYearId, search }) { return 'student_id,first_name,last_name\n'; }
}

module.exports = new StudentService();
