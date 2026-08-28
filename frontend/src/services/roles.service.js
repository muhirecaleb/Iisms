import api from './api';

export const listRoles = () =>
  api.get('/system/roles').then((r) => r.data.data || []);

export const getRolePermissions = (roleId) =>
  api.get(`/system/roles/${roleId}/permissions`).then((r) => r.data.data || []);

export const updateRolePermissions = (roleId, permissions) =>
  api.put(`/system/roles/${roleId}/permissions`, { permissions }).then((r) => r.data);

export const listModules = () =>
  api.get('/system/roles/modules').then((r) => r.data.data || []);

export const createRole = (data) =>
  api.post('/system/roles', data).then((r) => r.data.data);

export const deleteRole = (id) =>
  api.delete(`/system/roles/${id}`).then((r) => r.data);
