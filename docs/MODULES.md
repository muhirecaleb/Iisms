# 📦 IISMS Module Reference — Node.js + React

> **Branch:** `nodejs-react-migration`
> **Status:** 5 core modules planned, 16 total in catalog

---

## 1. Module Development Status

| Module | Key | Category | Status | Backend | Frontend |
|--------|-----|----------|--------|---------|----------|
| Auth & Users | `auth` | System | 📝 Planned | ✅ | ✅ |
| Dashboard | `dashboard` | System | 📝 Planned | ✅ | ✅ |
| Students | `students` | Academic Program | 📝 Planned | ✅ | ✅ |
| Human Resources | `staff` | General Admin | 📝 Planned | ✅ | ✅ |
| Finance | `finance` | General Admin | 📝 Planned | ✅ | ✅ |
| Tasks | `tasks` | Tasks | 📝 Planned | ✅ | ✅ |
| Academic Management | `academic` | Academic Program | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Learning Management | `learning` | Academic Program | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Library | `library` | Academic Program | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Inventory | `inventory` | General Admin | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Documents | `documents` | General Admin | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Quality Assurance | `qa` | General Admin | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Student Welfare | `welfare` | Social Impact | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Graduate Tracer | `tracer` | Social Impact | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Volunteers | `volunteers` | Social Impact | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Partnerships | `partnerships` | Resources | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| Projects | `projects` | Resources | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| System Settings | `system-settings` | System | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |
| User Management | `user-management` | System | 📝 Planned | 🏗️ Backlog | 🏗️ Backlog |

---

## 2. Core Module Specifications

### 2.1 Auth Module

**Purpose:** Authentication, authorization, OTP, and session management.

#### API Endpoints

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| POST | `/api/v1/auth/login` | rateLimit | Authenticate user, return access token + set refresh cookie |
| POST | `/api/v1/auth/send-otp` | rateLimit | Generate and send OTP code |
| POST | `/api/v1/auth/verify-otp` | rateLimit | Verify OTP and issue JWT tokens |
| POST | `/api/v1/auth/refresh` | cookieParser | Refresh access token using httpOnly cookie |
| POST | `/api/v1/auth/logout` | authMiddleware | Revoke refresh token |
| GET | `/api/v1/auth/me` | authMiddleware | Get current user profile + permissions |
| PUT | `/api/v1/auth/change-password` | authMiddleware | Change password (requires old password) |

#### Request/Response Examples

```javascript
// POST /api/v1/auth/login
// Request
{
  "username": "admin",
  "password": "password123"
}

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "fullName": "Administrator",
      "email": "admin@iisms.rw",
      "role": "Administrator"
    },
    "requiresOtp": true,
    "accessToken": null,  // Issued after OTP
    "expiresIn": 900      // 15 minutes
  }
}

// POST /api/v1/auth/send-otp
// Response
{
  "success": true,
  "data": {
    "maskedEmail": "adm***@iisms.rw",
    "expiresIn": 600,        // 10 minutes
    "devMode": true           // Shows code in dev mode
  }
}
```

#### Frontend Components

| Component | Route | Key Features |
|-----------|-------|--------------|
| `LoginPage` | `/login` | Username/password form, error handling, loading state |
| `VerifyOTPPage` | `/verify-otp` | 6-digit input boxes, auto-advance, paste support, resend timer |
| `AuthProvider` | Context | Token management, user state, login/logout/refresh methods |
| `ProtectedRoute` | Wrapper | Route guard with permission check, redirect to login |

#### Database Tables: `users`, `roles`, `otp_codes`, `refresh_tokens`, `login_logs`

---

### 2.2 Dashboard Module

**Purpose:** Role-based landing page with KPIs, quick-access links, and statistics.

#### API Endpoints

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/dashboard/stats` | auth, yearContext | Aggregated KPIs for current year |
| GET | `/api/v1/dashboard/recent-activity` | auth | Recent audit log entries |
| GET | `/api/v1/dashboard/alerts` | auth | Overdue tasks, pending invoices alerts |

#### KPI Response

```json
{
  "success": true,
  "data": {
    "students": {
      "total": 156,
      "active": 142,
      "male": 89,
      "female": 67,
      "newThisYear": 34
    },
    "staff": {
      "total": 28,
      "teaching": 18,
      "administrative": 8,
      "support": 2
    },
    "finance": {
      "totalInvoiced": 45000000,
      "totalCollected": 32500000,
      "outstanding": 12500000,
      "collectionRate": 72.2
    },
    "tasks": {
      "pending": 12,
      "inProgress": 5,
      "overdue": 3
    },
    "academicYear": {
      "label": "2025-2026",
      "currentTerm": "Term 2",
      "isCurrent": true
    }
  }
}
```

#### Frontend Components

| Component | Key Features |
|-----------|--------------|
| `DashboardPage` | KPI cards grid, role-based quick links, recent payments feed |
| `KpiCard` | Animated counter, icon, trend indicator, color-coded |
| `RecentActivityFeed` | Timeline of recent system actions |
| `AlertList` | Overdue tasks, pending actions with priority colors |

---

### 2.3 Student Information System

**Purpose:** Student lifecycle management — admission, registration, promotion, and record-keeping.

#### API Endpoints

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/students` | auth, rbac('students'), yearContext | List/search students (paginated) |
| GET | `/api/v1/students/:id` | auth, rbac('students') | Get student details + academic records + contacts |
| POST | `/api/v1/students` | auth, rbac('students') | Create student (full wizard data) |
| PUT | `/api/v1/students/:id` | auth, rbac('students') | Update student information |
| DELETE | `/api/v1/students/:id` | auth, rbac('students') | Soft-delete student |
| POST | `/api/v1/students/promote` | auth, rbac('students') | Promote students to next academic year |
| GET | `/api/v1/students/export` | auth, rbac('students') | Export student data as CSV |
| POST | `/api/v1/students/:id/contacts` | auth, rbac('students') | Add student contact |
| PUT | `/api/v1/students/contacts/:id` | auth, rbac('students') | Update student contact |
| DELETE | `/api/v1/students/contacts/:id` | auth, rbac('students') | Remove student contact |

#### Request/Response Examples

```javascript
// GET /api/v1/students?search=eric&page=1&limit=20
// Response
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "admissionNo": "INT-2026-001",
      "firstName": "Eric",
      "lastName": "Mucyo",
      "gender": "M",
      "class": "L3 SOD A",
      "level": "L3",
      "trade": "Software Development",
      "status": "active"
    }
    // ...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}

// POST /api/v1/students (Full wizard data)
// Request
{
  "firstName": "Jean",
  "lastName": "Baptiste",
  "gender": "M",
  "dateOfBirth": "2005-06-15",
  "nationality": "Rwandan",
  "residenceStatus": "Resident",
  "disability": "None",
  "parenthood": "Both Parents",
  "fatherName": "Jean Pierre",
  "motherName": "Marie Claire",
  "email": "jean.b@email.com",
  "phone": "0788123456",
  "officialPaperType": "National ID",
  "officialPaperNo": "1200567890123456",
  "province": "Kigali",
  "district": "Gasabo",
  "sector": "Kimironko",
  "cell": "Bibare",
  "village": "Rugando",
  "detailAddress": "KN 12 St",
  "academicYearId": 3,
  "classId": 15,
  "termId": 8,
  "boardingCategory": "Day",
  "sponsorshipType": "Self",
  "gorFunded": false,
  "contacts": [
    {
      "contactName": "Jean Pierre",
      "relationship": "Father",
      "idNumber": "1198765432101234",
      "phoneNumber": "0788223344",
      "email": "jp@email.com",
      "isPrimary": true,
      "isGuardian": true
    }
  ]
}

// Response (201)
{
  "success": true,
  "data": {
    "studentId": 157,
    "admissionNo": "INT-2026-157"
  },
  "message": "Student registered successfully"
}
```

#### Frontend Components

| Component | Route | Key Features |
|-----------|-------|--------------|
| `StudentListPage` | `/students` | Search, paginated table, gender/KPI stats, export button |
| `StudentAddPage` | `/students/add` | 3-step wizard (Personal → Academic → Contacts) with progress indicator |
| `StudentEditPage` | `/students/:id/edit` | Tabbed edit form, separate save sections |
| `StudentPromotePage` | `/students/promote` | Bulk selection, target class suggestions |
| `StudentExportPage` | Dialog | CSV format options, date range filter |

#### Database Tables: `students`, `student_academic_records`, `student_contacts`, `student_sponsorships`

#### Key Business Rules
- Admission number format: `INT-YYYY-NNN` (auto-generated, sequential per year)
- At least one contact with `is_primary = true`
- Students enrolled in exactly one academic year via `student_academic_records`
- Promotion creates new `student_academic_records` entry for next year

---

### 2.4 Human Resources / Staff Module

**Purpose:** Staff lifecycle management — registration, employment tracking, and year-over-year roster copying.

#### API Endpoints

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/staff` | auth, rbac('staff'), yearContext | List/search staff (paginated) |
| GET | `/api/v1/staff/:id` | auth, rbac('staff') | Get staff details |
| POST | `/api/v1/staff` | auth, rbac('staff') | Create staff member |
| PUT | `/api/v1/staff/:id` | auth, rbac('staff') | Update staff information |
| DELETE | `/api/v1/staff/:id` | auth, rbac('staff') | Soft-delete staff member |
| POST | `/api/v1/staff/:id/photo` | auth, rbac('staff'), upload | Upload staff photo |
| POST | `/api/v1/staff/copy-forward` | auth, rbac('staff') | Copy selected staff to new academic year |

#### Frontend Components

| Component | Route | Key Features |
|-----------|-------|--------------|
| `StaffListPage` | `/staff` | Searchable table, photo thumbnails, KPI cards |
| `StaffAddPage` | `/staff/add` | Single form with 3 tabs (Education/Employment/Residence), photo upload with preview |
| `StaffEditPage` | `/staff/:id/edit` | Same tabbed layout, pre-populated |
| `StaffCopyForwardPage` | `/staff/copy-forward` | Checkbox-based selection, target year selection |

#### Database Tables: `staff`, `staff_academic_years`, `file_uploads`

---

### 2.5 Finance Module

**Purpose:** School fee management following QuickBooks-style accounting.

#### API Endpoints

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/finance/dashboard` | auth, rbac('finance'), yearContext | KPI cards and overview |
| GET | `/api/v1/finance/fee-structure` | auth, rbac('finance'), yearContext | Get rate card matrix |
| POST | `/api/v1/finance/fee-structure` | auth, rbac('finance') | Upsert fee rate |
| GET | `/api/v1/finance/invoices` | auth, rbac('finance'), yearContext | List invoices (filterable) |
| POST | `/api/v1/finance/invoices/generate` | auth, rbac('finance') | Batch generate invoices for a term |
| GET | `/api/v1/finance/invoices/:id` | auth, rbac('finance') | Invoice detail with payments |
| PUT | `/api/v1/finance/invoices/:id` | auth, rbac('finance') | Update invoice (void, etc.) |
| GET | `/api/v1/finance/payments` | auth, rbac('finance') | List payments |
| POST | `/api/v1/finance/payments` | auth, rbac('finance') | Record payment (installment) — role-based limits enforced in controller |
| GET | `/api/v1/finance/sponsorships` | auth, rbac('finance'), yearContext | List sponsorships |
| POST | `/api/v1/finance/sponsorships` | auth, rbac('finance') | Create/update sponsorship |
| DELETE | `/api/v1/finance/sponsorships/:id` | auth, rbac('finance') | Delete sponsorship |
| GET | `/api/v1/finance/reports` | auth, rbac('finance'), yearContext | Aggregated financial reports |
| GET | `/api/v1/finance/student-statement/:studentId` | auth, rbac('finance'), yearContext | Per-student balance statement |
| GET | `/api/v1/finance/search-student` | auth, rbac('finance') | Search students for payment — available to Cashier + Accountant roles |

#### QuickBooks Accounting Pattern

```
fee_items (Product/Service Catalog)
  │
  ├── fee_structures (Standard Rate Card: level × term × fee_item)
  │
  ├── student_sponsorships (Customer Discount: student × year × %)
  │
  └── invoices (Per student per term)
          │
          └── payments (Installments, max 3 per invoice)
```

#### Finance Roles

| Role | Access Scope |
|------|-------------|
| **Cashier** | Search students, view invoices, record payments only |
| **Accountant** | Full CRUD: fee structure, invoices, sponsorships, payments |
| **Finance Manager** | Read-only: reports and dashboard only |

#### Frontend Components

| Component | Route | Key Features |
|-----------|-------|--------------|
| `FinanceDashboardPage` | `/finance` | KPI cards (total invoiced/collected/outstanding/rate) |
| `FeeStructurePage` | `/finance/fee-structure` | Matrix display per level × term |
| `InvoicesPage` | `/finance/invoices` | Filter by term/status, batch generate, invoice details |
| `ReceivePaymentPage` | `/finance/receive-payment` | Student search → invoice selection → payment form (max 3 installments) |
| `SponsorshipsPage` | `/finance/sponsorships` | Student search, sponsor assignment with % coverage |
| `ReportsPage` | `/finance/reports` | Chart.js visualizations, collection rates, top outstanding |
| `StudentStatementPage` | `/finance/statement/:id` | Term/year/3-year cycle view |

#### Database Tables: `fee_items`, `fee_structures`, `invoices`, `payments`, `student_sponsorships`

---

### 2.6 Tasks Module

**Purpose:** Cross-module task assignment and tracking.

#### API Endpoints

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/tasks` | auth | List tasks (filtered by role) |
| POST | `/api/v1/tasks` | auth, rbac('tasks') | Create task |
| PUT | `/api/v1/tasks/:id` | auth | Update task (status, etc.) |
| DELETE | `/api/v1/tasks/:id` | auth, rbac('tasks') | Delete task (managers only) |
| PUT | `/api/v1/tasks/:id/status` | auth | Quick status update |

#### Frontend Components

| Component | Route | Key Features |
|-----------|-------|--------------|
| `TaskBoardPage` | `/tasks` | Filterable task list, status badges, priority colors |
| `TaskFormPage` | `/tasks/add`, `/tasks/:id/edit` | Assignee, module tag, priority, due date |

#### Database Tables: `tasks`

---

## 3. Module File Structure (Backend)

Every module follows this pattern:

```
backend/src/modules/{module_name}/
├── {module}.controller.js    # HTTP layer
├── {module}.service.js       # Business logic
├── {module}.routes.js        # Route definitions
├── {module}.validation.js    # Joi schemas
└── {module}.test.js          # Tests
```

### Route Definition Pattern

```javascript
// students.routes.js
const router = require('express').Router();
const controller = require('./students.controller');
const { authMiddleware, rbacMiddleware, yearMiddleware, validate } = require('../../middleware');
const { listQuery, createSchema, updateSchema } = require('./students.validation');

router.use(authMiddleware);

router.get('/',
  yearMiddleware,
  rbacMiddleware('students'),
  validate(listQuery, 'query'),
  controller.list
);

router.get('/export',
  yearMiddleware,
  rbacMiddleware('students'),
  controller.export
);

router.get('/:id',
  rbacMiddleware('students'),
  controller.getById
);

router.post('/',
  rbacMiddleware('students'),
  validate(createSchema, 'body'),
  controller.create
);

router.put('/:id',
  rbacMiddleware('students'),
  validate(updateSchema, 'body'),
  controller.update
);

router.delete('/:id',
  rbacMiddleware('students'),
  controller.delete
);

router.post('/promote',
  rbacMiddleware('students'),
  controller.promote
);

module.exports = router;
```

### Module Registration (Auto-Discovery)

Routes are auto-discovered and registered in `backend/src/routes/index.js`:

```javascript
const fs = require('fs');
const path = require('path');
const router = require('express').Router();

const modulesDir = path.join(__dirname, '../modules');
fs.readdirSync(modulesDir).forEach(dir => {
  const routesPath = path.join(modulesDir, dir, `${dir}.routes.js`);
  if (fs.existsSync(routesPath)) {
    router.use(`/${dir}`, require(routesPath));
  }
});

module.exports = router;
```

---

## 4. Module File Structure (Frontend)

```
frontend/src/
├── pages/{module_name}/
│   ├── {Module}ListPage.jsx
│   ├── {Module}AddPage.jsx
│   ├── {Module}EditPage.jsx
│   └── {Module}DetailPage.jsx
└── services/{module}.service.js
```

### Route Configuration Pattern

```jsx
// App.jsx — Route configuration
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/verify-otp', element: <VerifyOTPPage /> },

  // Protected routes (MainLayout)
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/students', element: <ProtectedRoute module="students"><StudentListPage /></ProtectedRoute> },
      { path: '/students/add', element: <ProtectedRoute module="students"><StudentAddPage /></ProtectedRoute> },
      { path: '/students/:id/edit', element: <ProtectedRoute module="students"><StudentEditPage /></ProtectedRoute> },
      { path: '/students/promote', element: <ProtectedRoute module="students"><StudentPromotePage /></ProtectedRoute> },
      { path: '/staff', element: <ProtectedRoute module="staff"><StaffListPage /></ProtectedRoute> },
      { path: '/finance', element: <ProtectedRoute module="finance"><FinanceDashboardPage /></ProtectedRoute> },
      { path: '/tasks', element: <TaskBoardPage /> },  // All authenticated users
      { path: '/settings/profile', element: <ProfilePage /> },
    ],
  },

  // Error routes
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
```

---

## 5. Scaffolded Modules (Backlog)

12 modules remain from the SRD to be implemented. Each follows the same pattern as the built modules above.

### Academic Management (`academic`)
- **Tables needed:** `subjects`, `timetable_entries`, `assessments`, `marks`, `report_cards`
- **Endpoints:** Subject CRUD, timetable management, mark entry, report card generation
- **Frontend:** Academic calendar view, timetable grid, mark entry sheet, report card

### Learning Management (`learning`)
- **Tables needed:** `course_materials`, `assignments`, `submissions`, `online_quizzes`
- **Endpoints:** Material upload, assignment CRUD, submission management, quiz engine

### Library (`library`)
- **Tables needed:** `books`, `book_copies`, `borrowings`, `library_members`
- **Endpoints:** Book catalog, borrowing/return, member management, overdue tracking

### Inventory (`inventory`)
- **Tables needed:** `asset_categories`, `assets`, `asset_assignments`, `maintenance_logs`
- **Endpoints:** Asset CRUD, assignment tracking, maintenance scheduling

### Document Management (`documents`)
- **Tables needed:** `document_categories`, `documents`, `document_versions`
- **Endpoints:** Upload/versioning, category browsing, search

### Quality Assurance (`qa`)
- **Tables needed:** `nesa_indicators`, `evidence_items`, `internal_audits`, `compliance_checks`
- **Endpoints:** Indicator management, evidence upload, audit scheduling

### Student Welfare (`welfare`)
- **Tables needed:** `disciplinary_cases`, `counselling_sessions`, `health_records`, `club_memberships`
- **Endpoints:** Case management, session scheduling, health record tracking

### Graduate Tracer (`tracer`)
- **Tables needed:** `graduates`, `employments`, `employers`
- **Endpoints:** Graduate registration, employment tracking, survey management

### Volunteers (`volunteers`)
- **Tables needed:** `volunteer_profiles`, `volunteer_assignments`, `volunteer_hours`
- **Endpoints:** Profile management, assignment tracking, hours logging

### Partnerships (`partnerships`)
- **Tables needed:** `partner_organizations`, `partner_contacts`, `agreements`, `donations`
- **Endpoints:** Organization CRUD, agreement management, donation tracking

### Projects (`projects`)
- **Tables needed:** `project_categories`, `projects`, `project_participants`, `project_activities`
- **Endpoints:** Project CRUD, participant management, activity logging
