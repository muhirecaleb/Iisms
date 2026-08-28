import api from './api';

export const listLogs = ({ page = 1, limit = 50, action, moduleKey, userId, search, startDate, endDate } = {}) => {
  const params = { page, limit };
  if (action) params.action = action;
  if (moduleKey) params.moduleKey = moduleKey;
  if (userId) params.userId = userId;
  if (search) params.search = search;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return api.get('/system-logs', { params }).then((r) => r.data);
};

export const getLogStats = () =>
  api.get('/system-logs/stats').then((r) => r.data.data);

export const getActionTypes = () =>
  api.get('/system-logs/actions').then((r) => r.data.data);

export const getModuleKeys = () =>
  api.get('/system-logs/modules').then((r) => r.data.data);
