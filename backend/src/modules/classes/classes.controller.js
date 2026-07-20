const db = require('../../config/database');

exports.list = async (req, res, next) => {
  try {
    const yearId = req.academicYearId;
    const [rows] = await db.query('SELECT * FROM classes WHERE academic_year_id = ? ORDER BY level, class_name', [yearId]);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM classes WHERE class_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Class not found' } });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};
