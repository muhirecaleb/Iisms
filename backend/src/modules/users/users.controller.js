const userService = require('./users.service');

exports.list = async (req, res, next) => {
  try {
    const result = await userService.list(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await userService.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await userService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await userService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

exports.listRoles = async (req, res, next) => {
  try {
    const data = await userService.listRoles();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const data = await userService.resetPassword(req.params.id, req.body.password);
    res.json({ success: true, data, message: 'Password reset successfully' });
  } catch (error) { next(error); }
};
