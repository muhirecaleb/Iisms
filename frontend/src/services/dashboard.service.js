import api from './api';

/**
 * Fetch dashboard statistics.
 * @returns {Promise<{ students: Object, staff: Object, finance: Object, tasks: Object, academicYear: Object }>}
 */
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
};
