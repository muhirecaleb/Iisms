import api from './api';

/**
 * Fetch paginated list of students with search and filters.
 * @param {Object} params - { page, limit, search, gender, status, level }
 * @returns {Promise<{ data: Array, pagination: Object }>}
 */
export const listStudents = async (params = {}) => {
  const response = await api.get('/students', { params });
  return response.data;
};

/**
 * Get a single student by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
/**
 * Create a new student.
 * @param {Object} data - Student data matching createSchema
 * @returns {Promise<Object>}
 */
export const createStudent = async (data) => {
  const response = await api.post('/students', data);
  return response.data.data;
};

/**
 * Update an existing student.
 * @param {number} id
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>}
 */
export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data.data;
};

/**
 * Soft-delete a student.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteStudent = async (id) => {
  await api.delete(`/students/${id}`);
};
