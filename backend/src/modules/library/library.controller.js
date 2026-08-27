const libraryService = require('./library.service');

exports.listBooks = async (req, res, next) => {
  try {
    const result = await libraryService.listBooks(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.getBook = async (req, res, next) => {
  try {
    const data = await libraryService.getBook(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createBook = async (req, res, next) => {
  try {
    const data = await libraryService.createBook(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updateBook = async (req, res, next) => {
  try {
    const data = await libraryService.updateBook(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.deleteBook = async (req, res, next) => {
  try {
    await libraryService.deleteBook(req.params.id);
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const data = await libraryService.getCategories();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.borrowBook = async (req, res, next) => {
  try {
    const data = await libraryService.borrowBook({ ...req.body, issuedBy: req.user?.id });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.returnBook = async (req, res, next) => {
  try {
    const data = await libraryService.returnBook(req.params.id, { returnedTo: req.user?.id, ...req.body });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listTransactions = async (req, res, next) => {
  try {
    const result = await libraryService.listTransactions(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.getOverdueTransactions = async (req, res, next) => {
  try {
    const data = await libraryService.getOverdueTransactions();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await libraryService.getDashboard();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.seedBooks = async (req, res, next) => {
  try {
    const data = await libraryService.seedBooks();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
