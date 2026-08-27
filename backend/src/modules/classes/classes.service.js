const db = require('../../config/database');

/**
 * List all classes for an academic year with student counts.
 */
exports.list = async (academicYearId) => {
  const [rows] = await db.query(
    `SELECT c.*,
            CAST(COUNT(sar.record_id) AS UNSIGNED) AS student_count,
            CAST(SUM(CASE WHEN s.gender = 'M' THEN 1 ELSE 0 END) AS UNSIGNED) AS male_count,
            CAST(SUM(CASE WHEN s.gender = 'F' THEN 1 ELSE 0 END) AS UNSIGNED) AS female_count
     FROM classes c
     LEFT JOIN student_academic_records sar ON sar.class_id = c.class_id AND sar.academic_year_id = c.academic_year_id
     LEFT JOIN students s ON s.student_id = sar.student_id AND s.deleted_at IS NULL
     WHERE c.academic_year_id = ?
     GROUP BY c.class_id
     ORDER BY c.level, c.class_name`,
    [academicYearId]
  );
  return rows;
};

/**
 * Get a single class by ID with student count.
 */
exports.getById = async (classId) => {
  const [rows] = await db.query(
    `SELECT c.*,
            CAST(COUNT(sar.record_id) AS UNSIGNED) AS student_count
     FROM classes c
     LEFT JOIN student_academic_records sar ON sar.class_id = c.class_id
     WHERE c.class_id = ?
     GROUP BY c.class_id`,
    [classId]
  );
  if (!rows.length) return null;
  return rows[0];
};

/**
 * Create a new class.
 */
exports.create = async (data, academicYearId) => {
  const { className, trade, level } = data;
  const [result] = await db.query(
    'INSERT INTO classes (class_name, trade, level, academic_year_id) VALUES (?, ?, ?, ?)',
    [className, trade || null, level || null, academicYearId]
  );
  return exports.getById(result.insertId);
};

/**
 * Update an existing class.
 */
exports.update = async (classId, data) => {
  const fields = [];
  const values = [];

  if (data.className !== undefined) { fields.push('class_name = ?'); values.push(data.className); }
  if (data.trade !== undefined) { fields.push('trade = ?'); values.push(data.trade || null); }
  if (data.level !== undefined) { fields.push('level = ?'); values.push(data.level || null); }

  if (fields.length === 0) return exports.getById(classId);

  values.push(classId);
  await db.query(`UPDATE classes SET ${fields.join(', ')} WHERE class_id = ?`, values);
  return exports.getById(classId);
};

/**
 * Delete a class (only if no students are enrolled via student_academic_records).
 */
exports.remove = async (classId) => {
  const [[{ cnt }]] = await db.query(
    'SELECT COUNT(*) AS cnt FROM student_academic_records WHERE class_id = ?',
    [classId]
  );
  if (cnt > 0) {
    const err = new Error(`Cannot delete class: ${cnt} student(s) are still enrolled`);
    err.statusCode = 409;
    throw err;
  }
  await db.query('DELETE FROM classes WHERE class_id = ?', [classId]);
};

/**
 * List students enrolled in a class (via student_academic_records).
 */
exports.listStudents = async (classId, { page = 1, limit = 20, search = '' } = {}) => {
  page = Number(page);
  limit = Number(limit);
  const offset = (page - 1) * limit;
  let where = 'WHERE sar.class_id = ?';
  const params = [classId];

  if (search) {
    where += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total
     FROM student_academic_records sar
     JOIN students s ON s.student_id = sar.student_id AND s.deleted_at IS NULL
     ${where}`,
    params
  );

  const [rows] = await db.query(
    `SELECT s.student_id, s.admission_no, s.first_name, s.last_name, s.gender,
            s.date_of_birth, s.status, s.phone, s.email
     FROM student_academic_records sar
     JOIN students s ON s.student_id = sar.student_id AND s.deleted_at IS NULL
     ${where}
     ORDER BY s.last_name, s.first_name
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
