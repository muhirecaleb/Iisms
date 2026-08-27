import api from './api';

export const listUsers = (params = {}) =>
  api.get('/users', { params }).then((r) => r.data.data || []);

export const getUser = (id) =>
  api.get(`/users/${id}`).then((r) => r.data.data);

export const createUser = (data) =>
  api.post('/users', data).then((r) => r.data.data);

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then((r) => r.data.data);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then((r) => r.data);

export const listRoles = () =>
  api.get('/users/roles').then((r) => r.data.data || []);

export const resetPassword = (id, password) =>
  api.put(`/users/${id}/reset-password`, { password }).then((r) => r.data);
