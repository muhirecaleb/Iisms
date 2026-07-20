const db = require('../../config/database');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM academic_years ORDER BY year_id DESC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.setCurrent = async (req, res, next) => {
  try {
    await db.query('UPDATE academic_years SET is_current = FALSE');
    await db.query('UPDATE academic_years SET is_current = TRUE WHERE year_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Academic year updated' });
  } catch (error) { next(error); }
};
