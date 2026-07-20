const staffService = require('./staff.service');

exports.list = async (req, res, next) => {
  try {
    const result = await staffService.list({ ...req.query, academicYearId: req.academicYearId });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await staffService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await staffService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await staffService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await staffService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'Staff member removed' });
  } catch (error) { next(error); }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    const data = await staffService.uploadPhoto(req.params.id, req.file, req.user.id);
    res.json({ success: true, data, message: 'Photo uploaded successfully' });
  } catch (error) { next(error); }
};

exports.copyForward = async (req, res, next) => {
  try {
    const result = await staffService.copyForward(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
