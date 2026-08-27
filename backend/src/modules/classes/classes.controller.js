const classesService = require('./classes.service');

exports.list = async (req, res, next) => {
  try {
    const data = await classesService.list(req.academicYearId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await classesService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Class not found' } });
    }
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await classesService.create(req.body, req.academicYearId);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await classesService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    await classesService.remove(req.params.id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) { next(error); }
};

exports.listStudents = async (req, res, next) => {
  try {
    const result = await classesService.listStudents(req.params.id, req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};
