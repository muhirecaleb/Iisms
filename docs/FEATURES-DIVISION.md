# 👥 IISMS Feature Division — 3 Developers + Project Lead

> **Branch:** `nodejs-react-migration`
> **Approach:** 🚧 **Backend-first** — Build all API endpoints, services, and DB queries first. Frontend division will be planned after backend is stable.

---

## 📋 Team Roles

| Role | Person | Responsibility |
|------|--------|----------------|
| **👑 Project Lead** | You | Architecture, code review, CI/CD, GitHub management, integration testing, shared libs, sprint planning |
| **👨‍💻 Developer 1** | _TBD_ | **Students + Academic Years + Classes + Tasks** |
| **👨‍💻 Developer 2** | _TBD_ | **Staff (HR) + Finance** — the most complex module |
| **👨‍💻 Developer 3** | _TBD_ | **Auth + Dashboard + System Roles** — core infrastructure |

---

## 1. 🗺️ Backend Module Ownership

### Phase 1 — Core Infrastructure (Sprint 1)

| Area | Owner | Backend Files | Key Deliverables |
|------|-------|---------------|------------------|
| **Auth Module** | Dev 3 | `auth.controller.js`, `auth.service.js`, `auth.validation.js` | Login, OTP, JWT tokens, refresh, logout, change password, `/auth/me` |
| **Dashboard** | Dev 3 | `dashboard.controller.js` | KPI aggregation, stats endpoint, alert list, recent activity |
| **System Roles** | Dev 3 | `roles.controller.js` | Role CRUD, permission matrix |
| **Database Setup** | Lead | Migration scripts, seed data | Initial schema + demo accounts |
| **CI/CD + GitHub** | Lead | GitHub Actions, branch protection | Lint, test, build pipeline |
| **Code Review** | Lead | — | All PRs reviewed before merging |

### Phase 2 — Core Modules (Sprint 2-3)

| Module | Owner | Backend Files | Key Endpoints |
|--------|-------|---------------|---------------|
| **Students** | Dev 1 | `students.controller.js`, `students.service.js`, `students.validation.js` | CRUD, promote, export, contacts management |
| **Academic Years** | Dev 1 | `academic-years.controller.js` | Year CRUD, set current year |
| **Classes** | Dev 1 | `classes.controller.js` | Class CRUD, level + trade combination |
| **Tasks** | Dev 1 | `tasks.controller.js`, `tasks.service.js`, `tasks.validation.js` | CRUD, status update, role filtering |
| **Staff (HR)** | Dev 2 | `staff.controller.js`, `staff.service.js`, `staff.validation.js` | CRUD, photo upload, copy-forward |
| **Finance** | Dev 2 | `finance.controller.js`, `finance.service.js`, `finance.validation.js` | Fee structure, invoices (batch), payments, sponsorships, reports, student statements |

### Phase 3 — Remaining Modules (Sprint 4+)

| Module | Owner | New Backend Needed | Complexity |
|--------|-------|-------------------|------------|
| Academic Management | Dev 1 | routes + controller + service + validation | ⭐⭐⭐ |
| Learning Management | Dev 1 | routes + controller + service + validation | ⭐⭐⭐ |
| Student Welfare | Dev 1 | routes + controller + service + validation | ⭐⭐ |
| Inventory | Dev 2 | routes + controller + service + validation | ⭐⭐ |
| Document Management | Dev 2 | routes + controller + service + validation | ⭐⭐ |
| Quality Assurance | Dev 2 | routes + controller + service + validation | ⭐⭐⭐ |
| Graduate Tracer | Dev 3 | routes + controller + service + validation | ⭐⭐ |
| Volunteers | Dev 3 | routes + controller + service + validation | ⭐ |
| Partnerships | Dev 3 | routes + controller + service + validation | ⭐⭐ |
| Projects | Dev 3 | routes + controller + service + validation | ⭐⭐ |
| System Settings | Dev 3 | routes + controller + service + validation | ⭐ |

---

## 2. 📂 Backend Files Per Developer

### Developer 1 — Students + Academic Years + Classes + Tasks

```
backend/src/modules/
├── students/
│   ├── students.controller.js    ← YOURS — HTTP handlers
│   ├── students.service.js       ← YOURS — DB queries & business logic 🔑
│   ├── students.routes.js        ← YOURS — route definitions
│   └── students.validation.js    ← YOURS — Joi schemas
├── academic-years/
│   ├── academic-years.controller.js
│   └── academic-years.routes.js
├── classes/
│   ├── classes.controller.js
│   └── classes.routes.js
└── tasks/
    ├── tasks.controller.js
    ├── tasks.service.js          ← YOURS — DB queries 🔑
    ├── tasks.routes.js
    └── tasks.validation.js
```

**Key endpoints to implement:**
- `GET    /students` — List/search (paginated, filterable by year/class/gender)
- `GET    /students/:id` — Full detail + academic records + contacts
- `POST   /students` — Full wizard data (personal + academic + contacts)
- `PUT    /students/:id` — Partial update
- `DELETE /students/:id` — Soft delete
- `POST   /students/promote` — Bulk promotion to next year
- `GET    /students/export` — CSV download
- `POST   /students/:id/contacts` — Add contact
- `PUT    /students/contacts/:id` — Update contact
- `DELETE /students/contacts/:id` — Remove contact
- `GET    /academic-years` — List years
- `POST   /academic-years` — Create year
- `PUT    /academic-years/:id` — Update year
- `GET    /classes` — List/search classes
- `POST   /classes` — Create class
- `GET    /tasks` — List tasks (role-filtered)
- `POST   /tasks` — Create task
- `PUT    /tasks/:id` — Update task
- `PUT    /tasks/:id/status` — Quick status update
- `DELETE /tasks/:id` — Delete (managers only)

### Developer 2 — Staff (HR) + Finance (most complex)

```
backend/src/modules/
├── staff/
│   ├── staff.controller.js       ← YOURS — HTTP handlers
│   ├── staff.service.js          ← YOURS — DB queries, file upload 🔑
│   ├── staff.routes.js           ← YOURS — route definitions
│   └── staff.validation.js       ← YOURS — Joi schemas
├── finance/                      ← YOURS — BIGGEST module
│   ├── finance.controller.js
│   ├── finance.service.js        ← YOURS — complex joins & transactions 🔑
│   ├── finance.routes.js
│   └── finance.validation.js
```

**Key endpoints to implement (Staff):**
- `GET    /staff` — List/search (paginated)
- `GET    /staff/:id` — Full detail
- `POST   /staff` — Create (3-tab data: education, employment, residence)
- `PUT    /staff/:id` — Update
- `DELETE /staff/:id` — Soft delete
- `POST   /staff/:id/photo` — Upload photo (multer, validation)
- `POST   /staff/copy-forward` — Copy selected staff to new year

**Key endpoints to implement (Finance):**
- `GET    /finance/dashboard` — KPI cards + overview
- `GET    /finance/fee-structure` — Rate card matrix
- `POST   /finance/fee-structure` — Upsert fee rate
- `GET    /finance/invoices` — List invoices (filterable)
- `POST   /finance/invoices/generate` — Batch generate invoices
- `GET    /finance/invoices/:id` — Invoice detail with payments
- `PUT    /finance/invoices/:id` — Update (void, etc.)
- `GET    /finance/payments` — List payments
- `POST   /finance/payments` — Record installment (max 3 per invoice)
- `GET    /finance/sponsorships` — List sponsorships
- `POST   /finance/sponsorships` — Create/update sponsorship
- `DELETE /finance/sponsorships/:id` — Delete sponsorship
- `GET    /finance/reports` — Aggregated reports
- `GET    /finance/student-statement/:studentId` — Per-student balance
- `GET    /finance/search-student` — Student search for cashier

### Developer 3 — Auth + Dashboard + System Roles (Foundation)

```
backend/src/modules/
├── auth/
│   ├── auth.controller.js        ← YOURS — HTTP handlers
│   ├── auth.service.js           ← YOURS — JWT, OTP, password hashing 🔑
│   ├── auth.routes.js            ← YOURS — route definitions
│   └── auth.validation.js        ← YOURS — Joi schemas
├── dashboard/
│   ├── dashboard.controller.js   ← YOURS
│   └── dashboard.routes.js
└── system/roles/
    ├── roles.controller.js       ← YOURS
    └── roles.routes.js

backend/src/
├── middleware/
│   ├── auth.js                   ← YOURS — JWT verification middleware
│   ├── rbac.js                   ← YOURS — Permission check middleware
│   ├── validate.js               ← YOURS — Joi validation middleware
│   ├── errorHandler.js           ← YOURS — Global error handler
│   └── yearContext.js            ← YOURS — Academic year middleware
├── config/
│   ├── database.js               ← YOURS — MySQL connection pool
│   ├── environment.js            ← YOURS — env vars
│   └── cors.js                   ← YOURS — CORS config
├── utils/
│   ├── helpers.js                ← YOURS — Shared utilities
│   ├── logger.js                 ← YOURS — Winston logger
│   ├── errors.js                 ← YOURS — Custom error classes
│   └── constants.js              ← YOURS — Shared constants
├── routes/
│   └── index.js                  ← YOURS — Route aggregator
└── app.js                        ← YOURS — Express app setup
```

**Key endpoints to implement:**
- `POST   /auth/login` — Authenticate credentials
- `POST   /auth/send-otp` — Generate & send OTP
- `POST   /auth/verify-otp` — Verify OTP, issue JWT tokens
- `POST   /auth/refresh` — Refresh access token
- `POST   /auth/logout` — Revoke refresh token
- `GET    /auth/me` — Current user profile + permissions
- `PUT    /auth/change-password` — Change password
- `GET    /dashboard/stats` — Aggregated KPIs (students, staff, finance, tasks)
- `GET    /dashboard/recent-activity` — Audit log entries
- `GET    /dashboard/alerts` — Overdue tasks, pending invoices
- `GET    /system/roles` — List roles
- `POST   /system/roles` — Create role
- `PUT    /system/roles/:id` — Update role permissions

---

## 3. ✅ Backend Definition of Done

For **Phase 1 & 2** (backend only), each module is complete when:

- [ ] **API endpoints** — All endpoints working (tested with curl/Postman)
- [ ] **Validation** — Joi/Zod schemas for all request inputs
- [ ] **Error handling** — Proper HTTP status codes + error responses
- [ ] **RBAC** — Module permission checks applied via middleware
- [ ] **Academic Year** — Multi-year data filtering via `yearContext` middleware
- [ ] **DB queries** — Parameterized queries (no SQL injection)
- [ ] **Transactions** — Multi-table operations wrapped in transactions
- [ ] **PR** — Clean PR with endpoint list + curl examples
- [ ] **Review** — At least 1 approval from project lead
- [ ] **Merge** — Squash-merge to `main`

---

## 4. 🎨 Frontend — TBD (After Backend is Complete)

> **🚧 Frontend division will be planned once all backend APIs are stable and tested.**

The backend deliverables for frontend readiness:

| What's Needed | Who Provides | When |
|---------------|-------------|------|
| Complete API reference | All devs (per module) | After each PR |
| Swagger/OpenAPI spec | Lead (optional) | After Phase 2 |
| Shared UI component list | Lead | Before frontend sprint |
| Axios service patterns | Dev 3 (from `services/api.js`) | During Phase 1 |

**Frontend will be divided similarly:**
- **Dev 1** → Students pages + Tasks pages
- **Dev 2** → Staff pages + Finance pages (7 pages)
- **Dev 3** → Auth pages + Dashboard + Layout + Shared UI Kit + Settings

---

## 5. 📅 Sprint Plan (Backend Only)

### Sprint 1 — Foundation (Week 1)

| Person | Backend Work | Test Strategy |
|--------|-------------|---------------|
| **Lead** | Create DB migrations, seed data, GitHub Actions CI, branch protection on `main` | Run migrations, verify seed |
| **Dev 3** | **Auth module** (login, send-otp, verify-otp, refresh, logout, me, change-password) + **middleware** (auth, rbac, validate, errorHandler) + **config** (database pool, env, cors) + **utils** (helpers, logger, errors, constants) + **app.js + routes/index.js** | `POST /auth/login` → get token → `GET /auth/me` → `POST /auth/verify-otp` cycle |
| **Dev 1** | **Students module** — study the API reference, build DB queries for student CRUD (list with pagination, get detail, create, update, soft-delete) | `POST /students` → `GET /students` → `GET /students/:id` → `PUT /students/:id` |
| **Dev 2** | **Staff module** — build DB queries for staff CRUD (list, get, create with 3 tabs, update, soft-delete) + **Finance** — study the API reference, understand fee structure tables | `POST /staff` → `GET /staff` → `GET /staff/:id` |

### Sprint 2 — Core APIs (Week 2)

| Person | Backend Work | Test Strategy |
|--------|-------------|---------------|
| **Lead** | Integration test all endpoints, review all PRs, write demo data | Full API walkthrough |
| **Dev 3** | **Dashboard** (stats, recent-activity, alerts) + **System Roles** (CRUD + permissions) + refresh token polish | `GET /dashboard/stats` returns KPI data |
| **Dev 1** | **Students** — contacts CRUD, promote endpoint, CSV export + **Academic Years** (CRUD) + **Classes** (CRUD) | `POST /students/promote` → verify new academic record created |
| **Dev 2** | **Staff** — photo upload (multer), copy-forward endpoint + **Finance** — fee structure CRUD, batch invoice generation | `POST /staff/:id/photo` → upload image → `POST /finance/invoices/generate` |

### Sprint 3 — Finance Deep Dive (Week 3)

| Person | Backend Work | Test Strategy |
|--------|-------------|---------------|
| **Lead** | Performance review, end-to-end testing across modules, documentation updates | Full user journey: login → create student → create staff → generate invoice → record payment |
| **Dev 3** | Bug fixes, middleware polish, academic year context improvements, review PRs | `GET /dashboard/stats` cross-module data accuracy |
| **Dev 1** | **Tasks module** — CRUD + status update + role-filtered listing | `POST /tasks` → `PUT /tasks/:id/status` cycle |
| **Dev 2** | **Finance** — payments (installment logic, max 3 per invoice), sponsorships CRUD, reports, student statements, student search for cashier | `POST /finance/payments` → verify installment tracking → `GET /finance/reports` |

### Sprint 4+ — Remaining Backend Modules (Week 4+)

| Person | Backend Work |
|--------|-------------|
| **Lead** | Plan frontend sprint, appoint module leads for remaining modules |
| **Dev 1** | Academic Management → Learning Management → Student Welfare |
| **Dev 2** | Inventory → Document Management → Quality Assurance |
| **Dev 3** | Graduate Tracer → Volunteers → Partnerships → Projects → System Settings |

---

## 6. 🔧 Git Workflow

### Branch Strategy

```
main                    ← Protected! Only merged via PR with 1 approval
├── feature/students    ← Dev 1
├── feature/academicyears ← Dev 1
├── feature/classes     ← Dev 1
├── feature/tasks       ← Dev 1
├── feature/staff       ← Dev 2
├── feature/finance     ← Dev 2
├── feature/auth        ← Dev 3
├── feature/dashboard   ← Dev 3
├── feature/roles       ← Dev 3
└── feature/shared      ← Dev 3 (middleware, utils, config)
```

### Daily Workflow

```bash
# Start your day
git checkout main
git pull origin main
git checkout -b feature/my-feature

# Work, commit often
git add .
git commit -m "feat: add student list with pagination"

# Push & create PR
git push -u origin feature/my-feature
# → Open PR on GitHub, tag @project-lead for review
```

### Commit Message Convention

| Type | Example |
|------|---------|
| `feat:` | `feat: add student 3-step registration wizard` |
| `fix:` | `fix: fix OTP timer not resetting on resend` |
| `refactor:` | `refactor: extract payment validation into service` |
| `docs:` | `docs: update API reference for finance endpoints` |
| `test:` | `test: add unit tests for auth service` |

---

## 7. 🚦 Backend Dependency Order

```
Sprint 1                          Sprint 2                  Sprint 3
─────────                         ─────────                 ─────────

Dev 3: Config/Utils/Middleware ──→ Everyone uses these   ──→ Dev 3 polishes
Dev 3: Auth API              ──→ Everyone uses JWT      ──→ Dev 3: refresh token
          │
          ├──→ Dev 1: Students API ←── Academic Years + Classes
          │         ↓
          │         └──→ Dev 1: Tasks API
          │
          ├──→ Dev 2: Staff API
          │         ↓
          │         └──→ Dev 2: Finance API (fee → invoice → payment)
          │
          └──→ Dev 3: Dashboard API ←── depends on everyone's data
                    Dev 3: Roles API (standalone)
```

**⚠️ Critical path:** Dev 3's config (database pool), middleware (auth, rbac), and utils must be **done first** — everything else depends on them. The project lead should prioritize reviewing Dev 3's PRs before anyone else can start.

---

## 8. 📊 Module Complexity (Backend)

| Module | Endpoints | Database Tables | Special Complexity | Score |
|--------|-----------|----------------|-------------------|-------|
| Auth | 7 | `users`, `otp_codes`, `refresh_tokens`, `login_logs` | JWT signing, OTP hashing, rate limiting | ⭐⭐ |
| Dashboard | 3 | All tables | Complex aggregation queries across modules | ⭐⭐ |
| Students | 10 | `students`, `student_academic_records`, `student_contacts` | Multi-table wizard insert, promotion logic, CSV export | ⭐⭐⭐ |
| Staff | 7 | `staff`, `staff_academic_years`, `file_uploads` | Photo upload (multer), copy-forward logic | ⭐⭐ |
| Finance | 15 | `fee_items`, `fee_structures`, `invoices`, `payments`, `student_sponsorships` | QuickBooks pattern, installment limits (max 3), batch generation, reports | ⭐⭐⭐⭐⭐ |
| Tasks | 5 | `tasks` | Cross-module tagging, role-filtered queries | ⭐⭐ |
| Academic Years | 5 | `academic_years`, `terms` | Current-year switching logic | ⭐ |
| Classes | 5 | `classes` | Level + trade combination | ⭐ |
| System Roles | 5 | `roles`, `role_permissions`, `modules` | Permission matrix, RBAC middleware integration | ⭐⭐ |

---

## 9. 🔗 Quick Reference Links

| Resource | Location |
|----------|----------|
| API Reference (all endpoints) | `docs/API-REFERENCE.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Modules Status | `docs/MODULES.md` |
| Roles & Permissions | `docs/ROLES-PERMISSIONS.md` |
| Database Schema | `docs/DATABASE.md` |
| Setup Guide | `docs/SETUP.md` |
| Backend Entry | `backend/server.js` |
| App Setup | `backend/src/app.js` |
| Route Aggregator | `backend/src/routes/index.js` |

---

> **Last updated:** July 2026
> **Status:** 🟢 Backend Phase 1 — Ready to start
> **Next:** 🎨 Frontend division will be planned after Sprint 3
