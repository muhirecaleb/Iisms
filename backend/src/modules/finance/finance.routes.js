const router = require('express').Router();
const controller = require('./finance.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const yearContextMiddleware = require('../../middleware/yearContext');
const { feeRateSchema, generateInvoiceSchema, paymentSchema, sponsorshipSchema } = require('./finance.validation');

router.use(authMiddleware);

router.get('/academic-years', rbacMiddleware('finance', ['canView']), async (req, res, next) => {
  try {
    const [rows] = await require('../../config/database').query('SELECT year_id, year_label, is_current FROM academic_years ORDER BY year_id DESC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});
router.get('/dashboard', yearContextMiddleware, rbacMiddleware('finance', ['canView']), controller.dashboard);
router.get('/terms', rbacMiddleware('finance', ['canView']), async (req, res, next) => {
  try {
    const db = require('../../config/database');
    const [rows] = await db.query('SELECT term_id, term_name, academic_year_id FROM terms ORDER BY term_id ASC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});
router.get('/fee-items', rbacMiddleware('finance', ['canView']), controller.listFeeItems);
router.get('/fee-structure', yearContextMiddleware, rbacMiddleware('finance', ['canView']), controller.getFeeStructure);
router.post('/fee-structure', yearContextMiddleware, rbacMiddleware('finance', ['canCreate']), validate(feeRateSchema), controller.upsertFeeRate);
router.get('/invoices', yearContextMiddleware, rbacMiddleware('finance', ['canView']), controller.listInvoices);
router.post('/invoices/generate', yearContextMiddleware, rbacMiddleware('finance', ['canCreate']), validate(generateInvoiceSchema), controller.generateInvoices);
router.get('/invoices/:id', rbacMiddleware('finance', ['canView']), controller.getInvoiceDetail);
router.post('/payments', yearContextMiddleware, rbacMiddleware('finance', ['canCreate']), validate(paymentSchema), controller.recordPayment);
router.get('/sponsorships', yearContextMiddleware, rbacMiddleware('finance', ['canView']), controller.listSponsorships);
router.post('/sponsorships', yearContextMiddleware, rbacMiddleware('finance', ['canCreate']), validate(sponsorshipSchema), controller.upsertSponsorship);
router.delete('/sponsorships/:id', rbacMiddleware('finance', ['canDelete']), controller.deleteSponsorship);
router.get('/reports', yearContextMiddleware, rbacMiddleware('finance', ['canView']), controller.getReports);
router.get('/student-statement/:studentId', rbacMiddleware('finance', ['canView']), controller.getStudentStatement);
router.get('/search-student', rbacMiddleware('finance', ['canView']), controller.searchStudent);
router.post('/seed', yearContextMiddleware, rbacMiddleware('finance', ['canCreate']), controller.seedFinanceData);

module.exports = router;
