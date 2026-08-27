const router = require('express').Router();
const controller = require('./finance.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const yearContextMiddleware = require('../../middleware/yearContext');
const { feeRateSchema, generateInvoiceSchema, paymentSchema, sponsorshipSchema } = require('./finance.validation');

router.use(authMiddleware);

router.get('/dashboard', yearContextMiddleware, rbacMiddleware('finance'), controller.dashboard);
router.get('/fee-items', rbacMiddleware('finance'), controller.listFeeItems);
router.get('/fee-structure', yearContextMiddleware, rbacMiddleware('finance'), controller.getFeeStructure);
router.post('/fee-structure', yearContextMiddleware, rbacMiddleware('finance'), validate(feeRateSchema), controller.upsertFeeRate);
router.get('/invoices', yearContextMiddleware, rbacMiddleware('finance'), controller.listInvoices);
router.post('/invoices/generate', yearContextMiddleware, rbacMiddleware('finance'), validate(generateInvoiceSchema), controller.generateInvoices);
router.get('/invoices/:id', rbacMiddleware('finance'), controller.getInvoiceDetail);
router.post('/payments', yearContextMiddleware, rbacMiddleware('finance'), validate(paymentSchema), controller.recordPayment);
router.get('/sponsorships', yearContextMiddleware, rbacMiddleware('finance'), controller.listSponsorships);
router.post('/sponsorships', yearContextMiddleware, rbacMiddleware('finance'), validate(sponsorshipSchema), controller.upsertSponsorship);
router.delete('/sponsorships/:id', rbacMiddleware('finance'), controller.deleteSponsorship);
router.get('/reports', yearContextMiddleware, rbacMiddleware('finance'), controller.getReports);
router.get('/student-statement/:studentId', yearContextMiddleware, rbacMiddleware('finance'), controller.getStudentStatement);
router.get('/search-student', rbacMiddleware('finance'), controller.searchStudent);
router.post('/seed', yearContextMiddleware, rbacMiddleware('finance'), controller.seedFinanceData);

module.exports = router;
