const systemLogsService = require('./system-logs.service');

exports.list = async (req, res, next) => {
  try {
    const result = await systemLogsService.list(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await systemLogsService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.getActionTypes = async (req, res, next) => {
  try {
    const actions = await systemLogsService.getActionTypes();
    res.json({ success: true, data: actions });
  } catch (error) {
    next(error);
  }
};

exports.getModuleKeys = async (req, res, next) => {
  try {
    const modules = await systemLogsService.getModuleKeys();
    res.json({ success: true, data: modules });
  } catch (error) {
    next(error);
  }
};
