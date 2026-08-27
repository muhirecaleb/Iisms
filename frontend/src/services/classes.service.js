import api from './api';

/**
 * Fetch all classes for the current academic year.
 * @returns {Promise<Array>} Array of class objects with student counts
 */
export const listClasses = async () => {
  const response = await api.get('/classes');
  return response.data.data;
};

/**
 * Get a single class by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getClass = async (id) => {
  const response = await api.get(`/classes/${id}`);
  return response.data.data;
};

/**
 * Create a new class.
 * @param {Object} data - { className, trade, level }
 * @returns {Promise<Object>}
 */
export const createClass = async (data) => {
  const response = await api.post('/classes', data);
  return response.data.data;
};

/**
 * Update an existing class.
 * @param {number} id
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>}
 */
export const updateClass = async (id, data) => {
  const response = await api.put(`/classes/${id}`, data);
  return response.data.data;
};

/**
 * Delete a class.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteClass = async (id) => {
  await api.delete(`/classes/${id}`);
};

/**
 * List students enrolled in a class.
 * @param {number} classId
 * @param {Object} params - { page, limit, search }
 * @returns {Promise<{ data: Array, pagination: Object }>}
 */
export const listClassStudents = async (classId, params = {}) => {
  const response = await api.get(`/classes/${classId}/students`, { params });
  return response.data;
};
