const router = require('express').Router();
const controller = require('./finance.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const yearContextMiddleware = require('../../middleware/yearContext');

router.use(authMiddleware);

router.get('/dashboard', yearContextMiddleware, rbacMiddleware('finance'), controller.dashboard);
router.get('/fee-structure', yearContextMiddleware, rbacMiddleware('finance'), controller.getFeeStructure);
router.post('/fee-structure', rbacMiddleware('finance'), controller.upsertFeeRate);
router.get('/invoices', yearContextMiddleware, rbacMiddleware('finance'), controller.listInvoices);
router.post('/invoices/generate', rbacMiddleware('finance'), controller.generateInvoices);
router.get('/invoices/:id', rbacMiddleware('finance'), controller.getInvoiceDetail);
router.post('/payments', rbacMiddleware('finance'), controller.recordPayment);
router.get('/sponsorships', yearContextMiddleware, rbacMiddleware('finance'), controller.listSponsorships);
router.post('/sponsorships', rbacMiddleware('finance'), controller.upsertSponsorship);
router.delete('/sponsorships/:id', rbacMiddleware('finance'), controller.deleteSponsorship);
router.get('/reports', yearContextMiddleware, rbacMiddleware('finance'), controller.getReports);
router.get('/student-statement/:studentId', yearContextMiddleware, rbacMiddleware('finance'), controller.getStudentStatement);
router.get('/search-student', rbacMiddleware('finance'), controller.searchStudent);

module.exports = router;
