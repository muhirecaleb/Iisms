import api from './api';

export const listAcademicYears = () =>
  api.get('/academic-years').then((r) => r.data.data);

export const createAcademicYear = (data) =>
  api.post('/academic-years', data).then((r) => r.data.data);

export const setCurrentYear = (id) =>
  api.put(`/academic-years/${id}/current`).then((r) => r.data);

export const deleteAcademicYear = (id) =>
  api.delete(`/academic-years/${id}`).then((r) => r.data);
