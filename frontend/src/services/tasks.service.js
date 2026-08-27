import api from './api';

export const listTasks = (params = {}) =>
  api.get('/tasks', { params }).then((r) => r.data.data || []);

export const createTask = (data) =>
  api.post('/tasks', data).then((r) => r.data.data);

export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data).then((r) => r.data.data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);

export const updateTaskStatus = (id, status) =>
  api.put(`/tasks/${id}/status`, { status }).then((r) => r.data.data);

export const listUsers = () =>
  api.get('/tasks/users').then((r) => r.data.data || []);
