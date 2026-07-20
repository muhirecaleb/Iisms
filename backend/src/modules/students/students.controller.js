const studentService = require('./students.service');

exports.list = async (req, res, next) => {
  try {
    const result = await studentService.list({ ...req.query, academicYearId: req.academicYearId });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await studentService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await studentService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await studentService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await studentService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (error) { next(error); }
};

exports.promote = async (req, res, next) => {
  try {
    const result = await studentService.promote(req.body, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const csv = await studentService.exportCsv({ ...req.query, academicYearId: req.academicYearId });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="students_export.csv"`);
    res.send('\uFEFF' + csv); // UTF-8 BOM for Excel
  } catch (error) { next(error); }
};
