import api from './api';

export const listStaff = async (params = {}) => {
  const response = await api.get('/staff', { params });
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post('/staff', data);
  return response.data.data;
};

export const updateStaff = async (id, data) => {
  const response = await api.put(`/staff/${id}`, data);
  return response.data.data;
};

export const deleteStaff = async (id) => {
  await api.delete(`/staff/${id}`);
};
