/**
 * Full database seed for INTANGO TSS IISMS
 * Run: node seed-full.js
 * 
 * Creates:
 * - Roles & permissions
 * - Admin user (admin / admin123)
 * - Academic years & terms
 * - Classes (INTANGO TSS programs)
 * - Students (30+ realistic Rwandan names)
 * - Staff (10+)
 * - Fee items & structures
 * - Library books
 */

const db = require('./src/config/database');
const bcrypt = require('bcrypt');

const PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const STAFF_PASSWORD_HASH = bcrypt.hashSync('staff123', 10);

async function run() {
  console.log('🌱 Seeding INTANGO TSS database...\n');

  // ═══════════════════════════════════════════════════════════
  // 1. ROLES
  // ═══════════════════════════════════════════════════════════
  console.log('📋 Creating roles...');
  const roles = [
    ['Administrator', 'Full system access — all modules, all CRUD, system settings'],
    ['Director', 'Strategic oversight — KPIs, reports, all modules'],
    ['DOS', 'Academic program management, student oversight, timetabling'],
    ['Registrar', 'Student registration, records, promotions, exports'],
    ['Teacher', 'Basic student view, mark entry, personal tasks'],
    ['Discipline Officer', 'Student welfare, disciplinary records, counselling'],
    ['Accountant', 'Full finance: fee structure, invoices, sponsorships, payments'],
    ['Cashier', 'Payment recording only — search students, receive payments'],
    ['Finance Manager', 'Read-only finance reports and dashboard'],
    ['HR Officer', 'Staff management: registration, editing'],
    ['Librarian', 'Book catalog, borrow/return management'],
  ];

  for (const [name, desc] of roles) {
    await db.query('INSERT IGNORE INTO roles (role_name, description) VALUES (?, ?)', [name, desc]);
  }
  console.log(`  ✓ ${roles.length} roles created`);

  // ═══════════════════════════════════════════════════════════
  // 2. MODULES
  // ═══════════════════════════════════════════════════════════
  console.log('📦 Creating modules...');
  const modules = [
    ['dashboard', 'Dashboard', 1],
    ['students', 'Students', 2],
    ['staff', 'Staff', 3],
    ['finance', 'Finance', 4],
    ['tasks', 'Tasks', 5],
    ['classes', 'Classes', 6],
    ['academic-years', 'Academic Years', 7],
    ['library', 'Library', 8],
    ['system-settings', 'System Settings', 9],
    ['user-management', 'User Management', 10],
  ];

  for (const [key, label, order] of modules) {
    await db.query('INSERT IGNORE INTO modules (module_key, label, sort_order) VALUES (?, ?, ?)', [key, label, order]);
  }
  console.log(`  ✓ ${modules.length} modules created`);

  // ═══════════════════════════════════════════════════════════
  // 3. ROLE PERMISSIONS
  // ═══════════════════════════════════════════════════════════
  console.log('🔐 Setting up permissions...');
  const [roleRows] = await db.query('SELECT role_id, role_name FROM roles');
  const roleMap = {};
  roleRows.forEach(r => roleMap[r.role_name] = r.role_id);

  const permMatrix = {
    'Administrator': { dashboard:1, students:1, staff:1, finance:1, tasks:1, classes:1, 'academic-years':1, library:1, 'system-settings':1, 'user-management':1 },
    'Director':      { dashboard:1, students:1, staff:1, finance:1, tasks:1, classes:1, 'academic-years':1, library:1, 'system-settings':0, 'user-management':0 },
    'DOS':           { dashboard:1, students:1, staff:0, finance:0, tasks:1, classes:1, 'academic-years':1, library:0, 'system-settings':0, 'user-management':0 },
    'Registrar':     { dashboard:1, students:1, staff:0, finance:0, tasks:1, classes:1, 'academic-years':1, library:0, 'system-settings':0, 'user-management':0 },
    'Teacher':       { dashboard:1, students:0, staff:0, finance:0, tasks:1, classes:0, 'academic-years':0, library:0, 'system-settings':0, 'user-management':0 },
    'Discipline Officer': { dashboard:1, students:0, staff:0, finance:0, tasks:1, classes:0, 'academic-years':0, library:0, 'system-settings':0, 'user-management':0 },
    'Accountant':    { dashboard:1, students:0, staff:0, finance:1, tasks:1, classes:0, 'academic-years':0, library:0, 'system-settings':0, 'user-management':0 },
    'Cashier':       { dashboard:1, students:0, staff:0, finance:0, tasks:0, classes:0, 'academic-years':0, library:0, 'system-settings':0, 'user-management':0 },
    'Finance Manager': { dashboard:1, students:0, staff:0, finance:0, tasks:0, classes:0, 'academic-years':0, library:0, 'system-settings':0, 'user-management':0 },
    'HR Officer':    { dashboard:1, students:0, staff:1, finance:0, tasks:1, classes:0, 'academic-years':0, library:0, 'system-settings':0, 'user-management':0 },
    'Librarian':     { dashboard:1, students:0, staff:0, finance:0, tasks:0, classes:0, 'academic-years':0, library:1, 'system-settings':0, 'user-management':0 },
  };

  for (const [roleName, perms] of Object.entries(permMatrix)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;
    for (const [modKey, access] of Object.entries(perms)) {
      const canAll = access === 1;
      await db.query(
        'INSERT IGNORE INTO role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [roleId, modKey, 1, canAll ? 1 : 0, canAll ? 1 : 0, canAll ? 1 : 0]
      );
    }
  }
  console.log('  ✓ Permissions set for all roles');

  // ═══════════════════════════════════════════════════════════
  // 4. ADMIN USER
  // ═══════════════════════════════════════════════════════════
  console.log('👤 Creating users...');
  const users = [
    ['admin', PASSWORD_HASH, 'Muhire Caleb', 'admin@intangotss.rw', '+250788100001', roleMap['Administrator'], 'active'],
    ['thomas_dos', STAFF_PASSWORD_HASH, 'Thomas Habimana', 'thomas@intangotss.rw', '+250788100002', roleMap['DOS'], 'active'],
    ['jean_registrar', STAFF_PASSWORD_HASH, 'Jean Mugabo', 'jean@intangotss.rw', '+250788100003', roleMap['Registrar'], 'active'],
    ['marie_teacher', STAFF_PASSWORD_HASH, 'Marie Uwimana', 'marie@intangotss.rw', '+250788100004', roleMap['Teacher'], 'active'],
    ['pierre_teacher', STAFF_PASSWORD_HASH, 'Pierre Nshimiyimana', 'pierre@intangotss.rw', '+250788100005', roleMap['Teacher'], 'active'],
    ['grace_accountant', STAFF_PASSWORD_HASH, 'Grace Mukamana', 'grace@intangotss.rw', '+250788100006', roleMap['Accountant'], 'active'],
    ['eric_cashier', STAFF_PASSWORD_HASH, 'Eric Niyonzima', 'eric@intangotss.rw', '+250788100007', roleMap['Cashier'], 'active'],
    ['alice_lib', STAFF_PASSWORD_HASH, 'Alice Ishimwe', 'alice@intangotss.rw', '+250788100008', roleMap['Librarian'], 'active'],
    ['david_hr', STAFF_PASSWORD_HASH, 'David Bizimana', 'david@intangotss.rw', '+250788100009', roleMap['HR Officer'], 'active'],
    ['sarah_discipline', STAFF_PASSWORD_HASH, 'Sarah Nyirahabimana', 'sarah@intangotss.rw', '+250788100010', roleMap['Discipline Officer'], 'active'],
  ];

  for (const [username, hash, fullName, email, phone, roleId, status] of users) {
    await db.query(
      'INSERT IGNORE INTO users (username, password_hash, full_name, email, phone, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hash, fullName, email, phone, roleId, status]
    );
  }
  console.log(`  ✓ ${users.length} users created (admin / admin123)`);

  // ═══════════════════════════════════════════════════════════
  // 5. ACADEMIC YEARS & TERMS
  // ═══════════════════════════════════════════════════════════
  console.log('📅 Creating academic years & terms...');
  await db.query("INSERT IGNORE INTO academic_years (year_id, year_label, start_date, end_date, is_current) VALUES (1, '2026', '2026-01-05', '2026-12-18', 1)");
  await db.query("INSERT IGNORE INTO academic_years (year_id, year_label, start_date, end_date, is_current) VALUES (2, '2025', '2025-01-06', '2025-12-19', 0)");

  const terms = [
    [1, 1, 'Term 1', '2026-01-05', '2026-04-10'],
    [2, 1, 'Term 2', '2026-04-27', '2026-08-07'],
    [3, 1, 'Term 3', '2026-08-24', '2026-12-18'],
    [4, 2, 'Term 1', '2025-01-06', '2025-04-11'],
    [5, 2, 'Term 2', '2025-04-28', '2025-08-08'],
    [6, 2, 'Term 3', '2025-08-25', '2025-12-19'],
  ];
  for (const [termId, yearId, name, start, end] of terms) {
    await db.query('INSERT IGNORE INTO terms (term_id, academic_year_id, term_name, start_date, end_date) VALUES (?, ?, ?, ?, ?)', [termId, yearId, name, start, end]);
  }
  console.log('  ✓ 2 academic years, 6 terms');

  // ═══════════════════════════════════════════════════════════
  // 6. CLASSES (INTANGO TSS programs)
  // ═══════════════════════════════════════════════════════════
  console.log('🏫 Creating classes...');
  const classes = [
    ['L2 Computer Applications', 'L2'],
    ['L2 Digital Skills', 'L2'],
    ['L2 Domestic Electricity', 'L2'],
    ['L3 Software Development', 'L3'],
    ['L4 Software Development', 'L4'],
    ['L5 Software Development', 'L5'],
  ];

  for (const [name, level] of classes) {
    await db.query('INSERT IGNORE INTO classes (class_name, level, academic_year_id) VALUES (?, ?, 1)', [name, level]);
  }
  console.log(`  ✓ ${classes.length} classes`);

  const [classRows] = await db.query('SELECT class_id, class_name FROM classes');
  const classMap = {};
  classRows.forEach(c => classMap[c.class_name] = c.class_id);

  // ═══════════════════════════════════════════════════════════
  // 7. STUDENTS (30 Rwandan names)
  // ═══════════════════════════════════════════════════════════
  console.log('🎓 Creating students...');
  const studentData = [
    // L3 Software Development
    ['INT-26-001', 'Jean', 'Bizimana', 'M', 'L3 Software Development'],
    ['INT-26-002', 'Alice', 'Mukamana', 'F', 'L3 Software Development'],
    ['INT-26-003', 'Patrick', 'Habimana', 'M', 'L3 Software Development'],
    ['INT-26-004', 'Claudine', 'Uwera', 'F', 'L3 Software Development'],
    ['INT-26-005', 'Eric', 'Niyonzima', 'M', 'L3 Software Development'],
    ['INT-26-006', 'Grace', 'Ishimwe', 'F', 'L3 Software Development'],
    ['INT-26-007', 'Emmanuel', 'Nshimiyimana', 'M', 'L3 Software Development'],
    ['INT-26-008', 'Chantal', 'Nyiramana', 'F', 'L3 Software Development'],
    // L4 Software Development
    ['INT-26-009', 'Olivier', 'Gakuru', 'M', 'L4 Software Development'],
    ['INT-26-010', 'Diane', 'Kamikazi', 'F', 'L4 Software Development'],
    ['INT-26-011', 'Kevin', 'Mugisha', 'M', 'L4 Software Development'],
    ['INT-26-012', 'Sandrine', 'Nyinawumuntu', 'F', 'L4 Software Development'],
    ['INT-26-013', 'Baptiste', 'Hakizimana', 'M', 'L4 Software Development'],
    ['INT-26-014', 'Josiane', 'Uwimana', 'F', 'L4 Software Development'],
    ['INT-26-015', 'Dieudonné', 'Niyongira', 'M', 'L4 Software Development'],
    // L5 Software Development
    ['INT-26-016', 'Samuel', 'Bizimana', 'M', 'L5 Software Development'],
    ['INT-26-017', 'Ange', 'Mukabalisa', 'F', 'L5 Software Development'],
    ['INT-26-018', 'Yves', 'Twizeyimana', 'M', 'L5 Software Development'],
    ['INT-26-019', 'Marie', 'Nshimiyimana', 'F', 'L5 Software Development'],
    ['INT-26-020', 'Bernard', 'Sindayigaya', 'M', 'L5 Software Development'],
    ['INT-26-021', 'Immaculée', 'Kayitesi', 'F', 'L5 Software Development'],
    // L2 Computer Applications
    ['INT-26-022', 'Fiston', 'Irakoze', 'M', 'L2 Computer Applications'],
    ['INT-26-023', 'Blooming', 'Nyirahabimana', 'F', 'L2 Computer Applications'],
    ['INT-26-024', 'Dieu', 'Ndayisaba', 'M', 'L2 Computer Applications'],
    ['INT-26-025', 'Espérance', 'Uwineza', 'F', 'L2 Computer Applications'],
    // L2 Digital Skills
    ['INT-26-026', 'Aimable', 'Niyonsenga', 'M', 'L2 Digital Skills'],
    ['INT-26-027', 'Charline', 'Murekatete', 'F', 'L2 Digital Skills'],
    ['INT-26-028', 'Placide', 'Nzeyimana', 'M', 'L2 Digital Skills'],
    // L2 Domestic Electricity
    ['INT-26-029', 'Ishmael', 'Bimenyimana', 'M', 'L2 Domestic Electricity'],
    ['INT-26-030', 'Clarisse', 'Ingabire', 'F', 'L2 Domestic Electricity'],
    ['INT-26-031', 'Thierry', 'Munyaneza', 'M', 'L2 Domestic Electricity'],
    ['INT-26-032', 'Dative', 'Niyonsaba', 'F', 'L2 Computer Applications'],
  ];

  for (const [admNo, firstName, lastName, gender, className] of studentData) {
    const [ins] = await db.query(
      'INSERT IGNORE INTO students (admission_no, first_name, last_name, gender, status) VALUES (?, ?, ?, ?, ?)',
      [admNo, firstName, lastName, gender, 'active']
    );
    if (ins.insertId > 0 && classMap[className]) {
      await db.query(
        'INSERT IGNORE INTO student_academic_records (student_id, class_id, academic_year_id) VALUES (?, ?, 1)',
        [ins.insertId, classMap[className]]
      );
    }
  }
  console.log(`  ✓ ${studentData.length} students across ${classes.length} classes`);

  // ═══════════════════════════════════════════════════════════
  // 8. STAFF
  // ═══════════════════════════════════════════════════════════
  console.log('👥 Creating staff...');
  const staffData = [
    ['STF-001', 'Jean-Paul Hakizimana', 'M', 'Teaching', 'Senior Lecturer', 'Software Development', 'Full-Time', 'active'],
    ['STF-002', 'Marie Goreth Uwimana', 'F', 'Teaching', 'Lecturer', 'Networking & Security', 'Full-Time', 'active'],
    ['STF-003', 'Pierre Celestin Nshimiyimana', 'M', 'Teaching', 'Lecturer', 'Database Systems', 'Full-Time', 'active'],
    ['STF-004', 'Claude Rwasa', 'M', 'Teaching', 'Assistant Lecturer', 'Web Development', 'Part-Time', 'active'],
    ['STF-005', 'Ange Mutesi', 'F', 'Teaching', 'Assistant Lecturer', 'Digital Literacy', 'Part-Time', 'active'],
    ['STF-006', 'Emmanuel Habimana', 'M', 'Administrative', 'Accountant', 'Finance', 'Full-Time', 'active'],
    ['STF-007', 'Solange Nyirabahizi', 'F', 'Administrative', 'Receptionist', 'Front Office', 'Full-Time', 'active'],
    ['STF-008', 'Dieudonné Mugisha', 'M', 'Administrative', 'IT Technician', 'IT Department', 'Full-Time', 'active'],
    ['STF-009', 'Esperance Mukamana', 'F', 'Administrative', 'Secretary', 'Administration', 'Full-Time', 'active'],
    ['STF-010', 'Iracanyumuryezu Bizimana', 'M', 'Support', 'Librarian', 'Library', 'Full-Time', 'active'],
    ['STF-011', 'Chantal Nyiragatare', 'F', 'Support', 'Cleaner', 'Maintenance', 'Contract', 'active'],
    ['STF-012', 'Fidele Twizeyimana', 'M', 'Support', 'Security Guard', 'Security', 'Contract', 'active'],
  ];

  for (const [staffNo, fullName, gender, category, position, domain, contract, status] of staffData) {
    await db.query(
      'INSERT IGNORE INTO staff (staff_no, full_name, gender, staff_category, staff_position, domain, contract_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [staffNo, fullName, gender, category, position, domain, contract, status]
    );
  }
  console.log(`  ✓ ${staffData.length} staff members`);

  // ═══════════════════════════════════════════════════════════
  // 9. FEE ITEMS & STRUCTURES
  // ═══════════════════════════════════════════════════════════
  console.log('💰 Creating fee structure...');
  await db.query("INSERT IGNORE INTO fee_items (fee_item_id, item_name, description) VALUES (1, 'Tuition Fee', 'Per-term tuition'), (2, 'Exam Fee', 'Examination fee'), (3, 'Laboratory Fee', 'Lab and practical fee'), (4, 'Sports Fee', 'Sports and activities fee'), (5, 'Library Fee', 'Library access fee')");

  const feeStructure = [
    // L2 Short courses (uniform fees)
    ['L2', 1, 1, 167000], ['L2', 2, 1, 167000], ['L2', 3, 1, 167000],
    ['L2', 1, 2, 167000], ['L2', 1, 3, 167000],
    // L3 Software Development
    ['L3', 1, 1, 365000], ['L3', 2, 1, 15000], ['L3', 3, 1, 20000], ['L3', 4, 1, 10000], ['L3', 5, 1, 5000],
    ['L3', 1, 2, 330000], ['L3', 1, 3, 290000],
    // L4 Software Development
    ['L4', 1, 1, 365000], ['L4', 2, 1, 15000], ['L4', 3, 1, 20000], ['L4', 4, 1, 10000], ['L4', 5, 1, 5000],
    ['L4', 1, 2, 330000], ['L4', 1, 3, 290000],
    // L5 Software Development
    ['L5', 1, 1, 365000], ['L5', 2, 1, 15000], ['L5', 3, 1, 20000], ['L5', 4, 1, 10000], ['L5', 5, 1, 5000],
    ['L5', 1, 2, 330000], ['L5', 1, 3, 290000],
  ];

  for (const [level, itemId, termId, amount] of feeStructure) {
    await db.query(
      'INSERT IGNORE INTO fee_structures (level, fee_item_id, term_id, amount, academic_year_id) VALUES (?, ?, ?, ?, 1)',
      [level, itemId, termId, amount]
    );
  }
  console.log(`  ✓ ${feeStructure.length} fee rates across all levels and terms`);

  // ═══════════════════════════════════════════════════════════
  // 10. INVOICES (for some students)
  // ═══════════════════════════════════════════════════════════
  console.log('🧾 Generating invoices...');
  const [studentRows] = await db.query(
    `SELECT s.student_id, s.first_name, cls.level
     FROM students s
     JOIN student_academic_records sar ON s.student_id = sar.student_id
     JOIN classes cls ON sar.class_id = cls.class_id
     WHERE sar.academic_year_id = 1`
  );

  let invoiceCount = 0;
  for (const st of studentRows) {
    // Create tuition invoice for Term 1
    const amount = st.level === 'L2' ? 167000 : 365000;
    const [ins] = await db.query(
      'INSERT IGNORE INTO invoices (student_id, academic_year_id, term_id, amount_due, status) VALUES (?, 1, 1, ?, ?)',
      [st.student_id, amount, Math.random() > 0.6 ? 'open' : 'paid']
    );
    if (ins.insertId > 0) {
      invoiceCount++;
      // If paid, add a payment
      if (ins.insertId > 0 && Math.random() > 0.5) {
        await db.query(
          'INSERT INTO payments (invoice_id, amount, payment_method, reference_no, recorded_by) VALUES (?, ?, ?, ?, 1)',
          [ins.insertId, amount, 'bank_transfer', `PAY-${Date.now()}-${invoiceCount}`]
        );
      }
    }
  }
  console.log(`  ✓ ${invoiceCount} invoices created`);

  // ═══════════════════════════════════════════════════════════
  // 11. LIBRARY BOOKS
  // ═══════════════════════════════════════════════════════════
  console.log('📚 Creating library books...');
  const books = [
    ['Introduction to Algorithms', 'Thomas H. Cormen', '978-0262046305', 'MIT Press', 2022, 'Technology', 5, 'Shelf A1', 'Comprehensive introduction to algorithms'],
    ['Clean Code', 'Robert C. Martin', '978-0132350884', 'Prentice Hall', 2008, 'Technology', 4, 'Shelf A1', 'A handbook of agile software craftsmanship'],
    ['JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'OReilly Media', 2008, 'Technology', 3, 'Shelf A2', 'Unearthing the excellence in JavaScript'],
    ['Python Crash Course', 'Eric Matthes', '978-1593279288', 'No Starch Press', 2022, 'Technology', 6, 'Shelf A2', 'A hands-on, project-based introduction to Python'],
    ['Head First Design Patterns', 'Eric Freeman', '978-1492078005', 'OReilly Media', 2020, 'Technology', 3, 'Shelf A1', 'A brain-friendly guide to design patterns'],
    ['Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'McGraw-Hill', 2019, 'Technology', 4, 'Shelf A3', 'Foundational textbook on database management'],
    ['Computer Networking', 'James Kurose', '978-135928608', 'Pearson', 2021, 'Technology', 3, 'Shelf A3', 'Comprehensive introduction to networking'],
    ['Linux Command Line', 'Richard Blum', '978-1119700913', 'Wiley', 2021, 'Technology', 3, 'Shelf A2', 'Master the Linux command line'],
    ['Engineering Mathematics', 'K.A. Stroud', '978-1352010350', 'Red Globe Press', 2020, 'Mathematics', 5, 'Shelf B1', 'Comprehensive math for engineers'],
    ['Discrete Mathematics', 'Kenneth H. Rosen', '978-1259676512', 'McGraw-Hill', 2019, 'Mathematics', 4, 'Shelf B1', 'Essential discrete math for CS'],
    ['Physics for Scientists', 'Raymond Serway', '978-1337553292', 'Cengage', 2018, 'Science', 4, 'Shelf B2', 'Standard physics textbook'],
    ['Electric Circuits', 'Charles Alexander', '978-1259226229', 'McGraw-Hill', 2020, 'Science', 3, 'Shelf B2', 'Fundamental electric circuits'],
    ['Oxford Learners Dictionary', 'Diana Lean', '978-0194798792', 'Oxford University Press', 2020, 'Reference', 8, 'Shelf C1', 'Comprehensive English dictionary'],
    ['Cambridge Grammar', 'Raymond Murphy', '978-1316637630', 'Cambridge University Press', 2019, 'Reference', 5, 'Shelf C1', 'Advanced English grammar'],
    ['Things Fall Apart', 'Chinua Achebe', '978-0385474542', 'Anchor Books', 1994, 'Literature', 6, 'Shelf D1', 'Classic African literature'],
    ['The Alchemist', 'Paulo Coelho', '978-0062315007', 'HarperOne', 2014, 'Fiction', 5, 'Shelf D2', 'A fable about following your dreams'],
    ['Half of a Yellow Sun', 'Chimamanda Adichie', '978-1400032112', 'Vintage', 2006, 'Fiction', 4, 'Shelf D2', 'A novel about the Biafran War'],
    ['Digital Electronics', 'Roger Tokheim', '978-0073373881', 'McGraw-Hill', 2017, 'General', 3, 'Shelf E1', 'Digital electronics and logic'],
    ['Entrepreneurship', 'Robert Hisrich', '978-1259872990', 'McGraw-Hill', 2017, 'General', 4, 'Shelf E1', 'Starting and managing businesses'],
    ['Rwandan History', 'Jan Vansina', '978-0299102142', 'University of Wisconsin', 1998, 'General', 3, 'Shelf E2', 'Oral tradition and Rwandan history'],
  ];

  for (const [title, author, isbn, publisher, year, category, copies, location, desc] of books) {
    await db.query(
      'INSERT IGNORE INTO books (title, author, isbn, publisher, publication_year, category, total_copies, available_copies, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, author, isbn, publisher, year, category, copies, copies, location, desc]
    );
  }
  console.log(`  ✓ ${books.length} books across ${new Set(books.map(b=>b[5])).size} categories`);

  // ═══════════════════════════════════════════════════════════
  // 12. TASKS
  // ═══════════════════════════════════════════════════════════
  console.log('✅ Creating tasks...');
  const [[adminUser]] = await db.query('SELECT user_id FROM users WHERE username = ? LIMIT 1', ['admin']);
  const adminId = adminUser ? adminUser.user_id : 1;
  const tasks = [
    ['Prepare Term 1 exam timetable', 'Create the examination schedule for all L3-L5 classes', adminId, 'high', 'pending', 'academic'],
    ['Update student fee payments', 'Reconcile payments received with invoice records', adminId, 'urgent', 'in_progress', 'finance'],
    ['Library book inventory check', 'Verify all books are accounted for and update catalog', adminId, 'normal', 'pending', 'library'],
    ['Staff meeting preparation', 'Prepare agenda for monthly staff meeting', adminId, 'normal', 'completed', 'system-settings'],
    ['Student enrollment records', 'Verify all student records are up to date for Term 1', adminId, 'high', 'in_progress', 'students'],
    ['Update course materials list', 'Review and update software development course materials', adminId, 'normal', 'pending', 'academic'],
    ['Fee collection report', 'Generate monthly fee collection report for Director', adminId, 'high', 'pending', 'finance'],
    ['Equipment maintenance check', 'Check all computer lab equipment and report issues', adminId, 'low', 'pending', 'system-settings'],
  ];

  for (const [title, desc, userId, priority, status, module] of tasks) {
    await db.query(
      'INSERT INTO tasks (title, description, assigned_to, priority, status, module_key, due_date) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY))',
      [title, desc, userId, priority, status, module]
    );
  }
  console.log(`  ✓ ${tasks.length} tasks`);

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n✅ Database seeded successfully!\n');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  INTANGO TSS — IISMS Demo Data              │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  Login: admin / admin123                    │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  📊 2 Academic Years, 6 Terms              │');
  console.log('│  🏫 6 Classes (L2-L5)                       │');
  console.log('│  🎓 32 Students                             │');
  console.log('│  👥 12 Staff Members                        │');
  console.log('│  👤 10 Users                                │');
  console.log('│  💰 25 Fee Rates                            │');
  console.log('│  🧾 Invoices + Payments                     │');
  console.log('│  📚 20 Books                                │');
  console.log('│  ✅ 8 Tasks                                 │');
  console.log('└─────────────────────────────────────────────┘\n');

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
