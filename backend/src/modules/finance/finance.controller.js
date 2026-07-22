const financeService = require('./finance.service');

exports.dashboard = async (req, res, next) => {
  try {
    const data = await financeService.dashboard(req.academicYearId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getFeeStructure = async (req, res, next) => {
  try {
    const data = await financeService.getFeeStructure(req.academicYearId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.upsertFeeRate = async (req, res, next) => {
  try {
    await financeService.upsertFeeRate(req.body);
    res.json({ success: true, message: 'Fee rate saved' });
  } catch (error) { next(error); }
};

exports.listInvoices = async (req, res, next) => {
  try {
    const result = await financeService.listInvoices({ ...req.query, academicYearId: req.academicYearId });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.generateInvoices = async (req, res, next) => {
  try {
    const result = await financeService.generateInvoices(req.body, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.getInvoiceDetail = async (req, res, next) => {
  try {
    const data = await financeService.getInvoiceDetail(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const data = await financeService.recordPayment(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.listSponsorships = async (req, res, next) => {
  try {
    const data = await financeService.listSponsorships(req.academicYearId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.upsertSponsorship = async (req, res, next) => {
  try {
    const data = await financeService.upsertSponsorship(req.body, req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.deleteSponsorship = async (req, res, next) => {
  try {
    await financeService.deleteSponsorship(req.params.id);
    res.json({ success: true, message: 'Sponsorship removed' });
  } catch (error) { next(error); }
};

exports.getReports = async (req, res, next) => {
  try {
    const data = await financeService.getReports({ ...req.query, academicYearId: req.academicYearId });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getStudentStatement = async (req, res, next) => {
  try {
    const data = await financeService.getStudentStatement(req.params.studentId, req.query);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.searchStudent = async (req, res, next) => {
  try {
    const data = await financeService.searchStudent(req.query.q);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
