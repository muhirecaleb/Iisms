const service = require('./academic-years.service');

exports.list = async (req, res, next) => {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.setCurrent = async (req, res, next) => {
  try {
    await service.setCurrent(req.params.id);
    res.json({ success: true, message: 'Academic year set as current' });
  } catch (error) { next(error); }
};

exports.ensureCurrent = async (req, res, next) => {
  try {
    const data = await service.ensureCurrentYear();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Academic year deleted' });
  } catch (error) { next(error); }
};
