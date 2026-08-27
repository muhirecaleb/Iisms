const router = require('express').Router();
const controller = require('./library.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { createBookSchema, updateBookSchema, borrowBookSchema, returnBookSchema } = require('./library.validation');

router.use(authMiddleware);

// Books CRUD
router.get('/books', rbacMiddleware('library', ['canView']), controller.listBooks);
router.get('/books/categories', rbacMiddleware('library', ['canView']), controller.getCategories);
router.get('/books/:id', rbacMiddleware('library', ['canView']), controller.getBook);
router.post('/books', rbacMiddleware('library', ['canCreate']), validate(createBookSchema), controller.createBook);
router.put('/books/:id', rbacMiddleware('library', ['canEdit']), validate(updateBookSchema), controller.updateBook);
router.delete('/books/:id', rbacMiddleware('library', ['canDelete']), controller.deleteBook);

// Borrowing
router.post('/borrow', rbacMiddleware('library', ['canCreate']), validate(borrowBookSchema), controller.borrowBook);
router.put('/transactions/:id/return', rbacMiddleware('library', ['canEdit']), validate(returnBookSchema), controller.returnBook);

// Transactions
router.get('/transactions', rbacMiddleware('library', ['canView']), controller.listTransactions);
router.get('/transactions/overdue', rbacMiddleware('library', ['canView']), controller.getOverdueTransactions);

// Dashboard
router.get('/dashboard', rbacMiddleware('library', ['canView']), controller.getDashboard);

// Seed
router.post('/seed', rbacMiddleware('library', ['canCreate']), controller.seedBooks);

// Search students/staff for borrowing
router.get('/search-borrower', rbacMiddleware('library', ['canView']), async (req, res, next) => {
  try {
    const db = require('../../config/database');
    const q = `%${req.query.q || ''}%`;
    const type = req.query.type || 'student';

    let rows;
    if (type === 'student') {
      [rows] = await db.query(
        `SELECT s.student_id as id, s.first_name, s.last_name, s.admission_no as code,
          cls.class_name as detail, 'student' as type
         FROM students s
         LEFT JOIN student_academic_records sar ON s.student_id = sar.student_id
         LEFT JOIN classes cls ON sar.class_id = cls.class_id
         WHERE (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ?)
         AND s.deleted_at IS NULL
         ORDER BY s.first_name LIMIT 20`,
        [q, q, q]
      );
    } else {
      [rows] = await db.query(
        `SELECT staff_id as id,
          SUBSTRING_INDEX(full_name, ' ', 1) as first_name,
          SUBSTRING_INDEX(full_name, ' ', -1) as last_name,
          staff_no as code,
          staff_position as detail, 'staff' as type
         FROM staff
         WHERE (full_name LIKE ? OR staff_no LIKE ?)
         AND deleted_at IS NULL
         ORDER BY full_name LIMIT 20`,
        [q, q]
      );
    }
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

module.exports = router;
