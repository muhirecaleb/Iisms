const taskService = require('./tasks.service');

exports.list = async (req, res, next) => {
  try {
    const result = await taskService.list({ ...req.query, userId: req.user.id, role: req.user.role });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await taskService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await taskService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await taskService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'Task removed' });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const data = await taskService.updateStatus(req.params.id, req.body.status, req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
