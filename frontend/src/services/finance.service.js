import api from './api';

// ─── Finance Dashboard ───
export const getFinanceDashboard = () =>
  api.get('/finance/dashboard').then((r) => r.data.data);

// ─── Fee Structure ───
export const getFeeStructure = () =>
  api.get('/finance/fee-structure').then((r) => r.data.data);

export const upsertFeeRate = (data) =>
  api.post('/finance/fee-structure', data).then((r) => r.data.data);

export const listFeeItems = () =>
  api.get('/finance/fee-items').then((r) => r.data.data);

// ─── Invoices ───
export const listInvoices = (params = {}) =>
  api.get('/finance/invoices', { params }).then((r) => r.data.data);

export const generateInvoices = (data) =>
  api.post('/finance/invoices/generate', data).then((r) => r.data.data);

export const getInvoiceDetail = (id) =>
  api.get(`/finance/invoices/${id}`).then((r) => r.data.data);

export const recordPayment = (data) =>
  api.post('/finance/payments', data).then((r) => r.data.data);

// ─── Sponsorships ───
export const listSponsorships = () =>
  api.get('/finance/sponsorships').then((r) => r.data.data);

export const upsertSponsorship = (data) =>
  api.post('/finance/sponsorships', data).then((r) => r.data.data);

export const deleteSponsorship = (id) =>
  api.delete(`/finance/sponsorships/${id}`).then((r) => r.data.data);

// ─── Student Search (for sponsorship form) ───
export const searchStudents = (query) =>
  api.get('/finance/search-student', { params: { q: query } }).then((r) => r.data.data || []);

// ─── Academic Years (for dropdown) ───
export const listAcademicYears = () =>
  api.get('/finance/academic-years').then((r) => r.data.data || []);

// ─── Terms (for dropdown) ───
export const listTerms = () =>
  api.get('/finance/terms').then((r) => r.data.data || []);

// ─── Seed Finance Demo Data ───
export const seedFinanceData = () =>
  api.post('/finance/seed').then((r) => r.data);
