const db = require('../../config/database');

exports.stats = async (req, res, next) => {
  try {
    const yearId = req.academicYearId;
    const role = req.user.role;

    // Students KPI
    const [studentStats] = await db.query(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN s.status='active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN s.gender='M' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN s.gender='F' THEN 1 ELSE 0 END) as female
       FROM students s
       JOIN student_academic_records sar ON s.student_id = sar.student_id
       WHERE sar.academic_year_id = ? AND s.deleted_at IS NULL`,
      [yearId]
    );

    // Staff KPI
    const [staffStats] = await db.query(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN staff_category='Teaching' THEN 1 ELSE 0 END) as teaching
       FROM staff s
       JOIN staff_academic_years say ON s.staff_id = say.staff_id
       WHERE say.academic_year_id = ? AND s.deleted_at IS NULL`,
      [yearId]
    );

    // Finance KPI
    const [financeKpi] = await db.query(
      `SELECT COALESCE(SUM(CASE WHEN i.status!='void' THEN i.amount_due ELSE 0 END),0) as invoiced,
        COALESCE((SELECT SUM(p.amount) FROM payments p JOIN invoices i2 ON p.invoice_id=i2.invoice_id WHERE i2.academic_year_id=?),0) as collected
       FROM invoices i WHERE i.academic_year_id=?`,
      [yearId, yearId]
    );

    // Tasks KPIs
    const [taskStats] = await db.query(
      `SELECT status, COUNT(*) as cnt FROM tasks GROUP BY status`
    );
    const taskMap = {};
    taskStats.forEach(t => { taskMap[t.status] = t.cnt; });

    // Academic year info
    const [yearInfo] = await db.query(
      `SELECT ay.*, t.term_name as current_term FROM academic_years ay LEFT JOIN terms t ON t.academic_year_id=ay.year_id AND t.is_current=1 WHERE ay.year_id=?`,
      [yearId]
    );

    res.json({
      success: true,
      data: {
        students: { ...studentStats[0], newThisYear: studentStats[0].active },
        staff: { ...staffStats[0], administrative: 0, support: 0 },
        finance: {
          totalInvoiced: financeKpi[0].invoiced,
          totalCollected: financeKpi[0].collected,
          outstanding: financeKpi[0].invoiced - financeKpi[0].collected,
          collectionRate: financeKpi[0].invoiced > 0 ? ((financeKpi[0].collected / financeKpi[0].invoiced) * 100).toFixed(1) : 0,
        },
        tasks: {
          pending: taskMap.pending || 0,
          inProgress: taskMap.in_progress || 0,
          overdue: 0,
        },
        academicYear: yearInfo[0] || { year_label: 'N/A', current_term: 'N/A', is_current: false },
      },
    });
  } catch (error) { next(error); }
};
