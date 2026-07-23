/**
 * Seed academic years, terms, classes, and sample students.
 * Run: node seed-data.js
 */
const db = require('./src/config/database');

async function seed() {
  // ─── 1. Academic Year ────────────────────────────────────
  let yearId;
  const [existingYears] = await db.query(
    "SELECT year_id FROM academic_years WHERE year_label = '2026'"
  );
  if (existingYears.length > 0) {
    yearId = existingYears[0].year_id;
    console.log(`Academic year 2026 already exists (id=${yearId})`);
  } else {
    const [result] = await db.query(
      `INSERT INTO academic_years (year_label, start_date, end_date, is_current)
       VALUES ('2026', '2026-01-01', '2026-12-31', TRUE)`
    );
    yearId = result.insertId;
    console.log(`Created academic year 2026 (id=${yearId}, current=TRUE)`);
  }

  // Ensure it's set as current
  await db.query('UPDATE academic_years SET is_current = TRUE WHERE year_id = ?', [yearId]);

  // ─── 2. Terms ────────────────────────────────────────────
  const terms = [
    { name: 'Term 1', start: '2026-01-15', end: '2026-04-30', current: 1 },
    { name: 'Term 2', start: '2026-05-15', end: '2026-08-30', current: 0 },
    { name: 'Term 3', start: '2026-09-15', end: '2026-12-15', current: 0 },
  ];

  let term1Id;
  for (const t of terms) {
    const [existing] = await db.query(
      'SELECT term_id FROM terms WHERE academic_year_id = ? AND term_name = ?',
      [yearId, t.name]
    );
    if (existing.length > 0) {
      console.log(`  Term "${t.name}" already exists (id=${existing[0].term_id})`);
      if (t.current) term1Id = existing[0].term_id;
      continue;
    }
    const [result] = await db.query(
      'INSERT INTO terms (academic_year_id, term_name, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?)',
      [yearId, t.name, t.start, t.end, t.current]
    );
    console.log(`  Created term "${t.name}" (id=${result.insertId}, current=${t.current})`);
    if (t.current) term1Id = result.insertId;
  }

  // Reset — only Term 1 is current
  await db.query('UPDATE terms SET is_current = FALSE WHERE academic_year_id = ?', [yearId]);
  await db.query(
    'UPDATE terms SET is_current = TRUE WHERE academic_year_id = ? AND term_name = ?',
    [yearId, 'Term 1']
  );

  // ─── 3. Classes ──────────────────────────────────────────
  const classList = [
    { name: 'S1 MEC',          level: 'S1', trade: 'MEC' },
    { name: 'S1 LME',          level: 'S1', trade: 'LME' },
    { name: 'S2 MEC',          level: 'S2', trade: 'MEC' },
    { name: 'S2 LME',          level: 'S2', trade: 'LME' },
    { name: 'S3 MEC',          level: 'S3', trade: 'MEC' },
    { name: 'S3 LME',          level: 'S3', trade: 'LME' },
    { name: 'S4 MEC',          level: 'S4', trade: 'MEC' },
    { name: 'S4 LME',          level: 'S4', trade: 'LME' },
    { name: 'S5 MEC',          level: 'S5', trade: 'MEC' },
    { name: 'S5 LME',          level: 'S5', trade: 'LME' },
    { name: 'S6 MEC',          level: 'S6', trade: 'MEC' },
    { name: 'S6 LME',          level: 'S6', trade: 'LME' },
  ];

  let firstClassId;
  for (const c of classList) {
    const [existing] = await db.query(
      'SELECT class_id FROM classes WHERE academic_year_id = ? AND class_name = ? AND level = ?',
      [yearId, c.name, c.level]
    );
    if (existing.length > 0) {
      console.log(`  Class "${c.name}" already exists (id=${existing[0].class_id})`);
      if (!firstClassId) firstClassId = existing[0].class_id;
      continue;
    }
    const [result] = await db.query(
      'INSERT INTO classes (academic_year_id, class_name, level, trade, capacity) VALUES (?, ?, ?, ?, ?)',
      [yearId, c.name, c.level, c.trade, 40]
    );
    console.log(`  Created class "${c.name}" (id=${result.insertId})`);
    if (!firstClassId) firstClassId = result.insertId;
  }

  // ─── 4. Sample Students ──────────────────────────────────
  const students = [
    { first: 'Jean',     last: 'Bizimana',  gender: 'M', dob: '2008-03-15', classIdx: 0 },
    { first: 'Alice',    last: 'Mukamana',  gender: 'F', dob: '2009-07-22', classIdx: 1 },
    { first: 'Patrick',  last: 'Habimana',  gender: 'M', dob: '2007-11-08', classIdx: 2 },
    { first: 'Diane',    last: 'Uwimana',   gender: 'F', dob: '2008-05-30', classIdx: 3 },
    { first: 'Eric',     last: 'Niyonzima', gender: 'M', dob: '2009-01-12', classIdx: 0 },
    { first: 'Grace',    last: 'Ishimwe',   gender: 'F', dob: '2007-09-04', classIdx: 4 },
    { first: 'Samuel',   last: 'Hakizimana', gender: 'M', dob: '2008-12-19', classIdx: 5 },
    { first: 'Chantal',  last: 'Nyirimana', gender: 'F', dob: '2009-04-25', classIdx: 1 },
    { first: 'David',    last: 'Mugisha',   gender: 'M', dob: '2007-06-14', classIdx: 6 },
    { first: 'Esther',   last: 'Kayitesi',  gender: 'F', dob: '2008-08-10', classIdx: 7 },
  ];

  // Get all class IDs
  const [allClasses] = await db.query(
    'SELECT class_id FROM classes WHERE academic_year_id = ? ORDER BY class_id',
    [yearId]
  );

  let created = 0;
  for (const s of students) {
    const classId = allClasses[s.classIdx]?.class_id;
    if (!classId) continue;

    // Check if student already exists by admission number pattern
    const name = `${s.first} ${s.last}`;
    const [dup] = await db.query(
      "SELECT s.student_id FROM students s JOIN student_academic_records sar ON s.student_id = sar.student_id WHERE s.first_name = ? AND s.last_name = ? AND sar.academic_year_id = ?",
      [s.first, s.last, yearId]
    );
    if (dup.length > 0) {
      console.log(`  Student "${name}" already exists (id=${dup[0].student_id})`);
      continue;
    }

    // Generate admission number
    const yearShort = '26';
    const [seq] = await db.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(admission_no, -3) AS UNSIGNED)), 0) + 1 as next_seq FROM students WHERE admission_no LIKE ?",
      [`INT-${yearShort}-%`]
    );
    const admissionNo = `INT-${yearShort}-${String(seq[0].next_seq).padStart(3, '0')}`;

    // Insert student
    const [studentResult] = await db.query(
      `INSERT INTO students (admission_no, first_name, last_name, gender, date_of_birth, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'active', 1)`,
      [admissionNo, s.first, s.last, s.gender, s.dob]
    );

    // Insert academic record
    await db.query(
      `INSERT INTO student_academic_records (student_id, academic_year_id, class_id, boarding_category, sponsorship_type)
       VALUES (?, ?, ?, 'Day', 'Private')`,
      [studentResult.insertId, yearId, classId]
    );

    console.log(`  Created student "${name}" (admission: ${admissionNo})`);
    created++;
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Academic Year: 2026 (current)`);
  console.log(`   Terms: Term 1 (current), Term 2, Term 3`);
  console.log(`   Classes: ${allClasses.length}`);
  console.log(`   Students created: ${created}`);
  console.log(`\n🎉 You can now test the Students page with real data!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
