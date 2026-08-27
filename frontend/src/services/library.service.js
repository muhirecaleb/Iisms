import api from './api';

// Books
export const listBooks = (params) =>
  api.get('/library/books', { params }).then(r => r.data.data || []);

export const getBook = (id) =>
  api.get(`/library/books/${id}`).then(r => r.data.data);

export const createBook = (data) =>
  api.post('/library/books', data).then(r => r.data.data);

export const updateBook = (id, data) =>
  api.put(`/library/books/${id}`, data).then(r => r.data.data);

export const deleteBook = (id) =>
  api.delete(`/library/books/${id}`).then(r => r.data);

export const getBookCategories = () =>
  api.get('/library/books/categories').then(r => r.data.data || []);

// Borrowing
export const borrowBook = (data) =>
  api.post('/library/borrow', data).then(r => r.data.data);

export const returnBook = (id, data) =>
  api.put(`/library/transactions/${id}/return`, data).then(r => r.data.data);

// Transactions
export const listTransactions = (params) =>
  api.get('/library/transactions', { params }).then(r => r.data.data || []);

export const getOverdueTransactions = () =>
  api.get('/library/transactions/overdue').then(r => r.data.data || []);

// Dashboard
export const getLibraryDashboard = () =>
  api.get('/library/dashboard').then(r => r.data.data);

// Search borrower
export const searchBorrower = (params) =>
  api.get('/library/search-borrower', { params }).then(r => r.data.data || []);

// Seed
export const seedLibraryData = () =>
  api.post('/library/seed').then(r => r.data.data);
