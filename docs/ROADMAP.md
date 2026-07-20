# 🗺️ IISMS Migration Roadmap — PHP → Node.js + React + MySQL

> **Branch:** `nodejs-react-migration`
> **Source:** `master` branch (PHP prototype)
> **Target:** Full Node.js + React + MySQL re-architecture

---

## 1. Migration Overview

The migration is organized into **4 phases** with clear deliverables and checkpoints.

| Phase | Focus | Duration (est.) | Status |
|-------|-------|-----------------|--------|
| **Phase 0** | Architecture & Documentation | 1 week | ✅ **Complete** |
| **Phase 1** | Core Backend + Database | 3 weeks | 📝 Planning |
| **Phase 2** | Core Frontend | 3 weeks | 📝 Planning |
| **Phase 3** | Feature Modules | 6 weeks | 📝 Planning |
| **Phase 4** | Testing, Optimization, Deployment | 2 weeks | 📝 Planning |

---

## 2. Phase 0: Architecture & Documentation ✅

**Status: Complete**

### Deliverables

| Task | File | Status |
|------|------|--------|
| README with new stack overview | `README.md` | ✅ Complete |
| System architecture guide | `docs/ARCHITECTURE.md` | ✅ Complete |
| MySQL database schema | `docs/DATABASE.md` | ✅ Complete |
| Module reference | `docs/MODULES.md` | ✅ Complete |
| API reference | `docs/API-REFERENCE.md` | ✅ Complete |
| Roles & permissions matrix | `docs/ROLES-PERMISSIONS.md` | ✅ Complete |
| Contributing guide | `docs/CONTRIBUTING.md` | ✅ Complete |
| Setup guide | `docs/SETUP.md` | ✅ Complete |
| Migration roadmap | `docs/ROADMAP.md` | ✅ This file |
| Git initialization + branch creation | — | ✅ Complete |

---

## 3. Phase 1: Core Backend + Database

**Duration:** 3 weeks (Weeks 1-3)

### Week 1: Database & Project Scaffolding

| Day | Task | Details |
|-----|------|---------|
| 1 | Project structure scaffolding | Create backend/ and frontend/ directories, package.json files |
| 2 | Database migration files | Write `001_initial_schema.sql`, `002_seed_data.sql`, `003_demo_accounts.sql` |
| 3 | Backend config + middleware | `config/database.js`, `config/environment.js`, middleware: auth, rbac, validate, errorHandler |
| 4 | Backend routes scaffold | `routes/index.js` auto-discovery, health endpoint |
| 5 | Frontend project setup | Vite + React scaffold, Axios setup, routing skeleton |
| 6 | Integration test | Backend + frontend connect, health check passes |
| 7 | **Milestone: M1** | ✅ Project scaffold, database running, health check working |

### Database Schema Implementation

**Key SQL files to create:**
```bash
database/migrations/
├── 001_initial_schema.sql    # All 20+ CREATE TABLE statements
├── 002_seed_data.sql         # Roles, modules, permissions, academic years
└── 003_demo_accounts.sql     # 11 demo users with hashed passwords
```

**Core tables to implement (in order):**
1. `roles`, `modules` (no dependencies)
2. `users` (depends on roles)
3. `role_permissions` (depends on roles + modules)
4. `refresh_tokens`, `otp_codes`, `login_logs` (depends on users)
5. `audit_log`, `file_uploads` (depends on users)
6. `academic_years`, `terms`, `classes` (academic year chain)
7. `students`, `student_academic_records`, `student_contacts` (students)
8. `staff`, `staff_academic_years` (staff)
9. `fee_items`, `fee_structures`, `invoices`, `payments`, `student_sponsorships` (finance)
10. `tasks`

---

### Week 2: Auth System

| Day | Task | Details |
|-----|------|---------|
| 1 | Backend: Login endpoint | POST /auth/login — username/password validation, bcrypt verify |
| 2 | Backend: OTP system | POST /auth/send-otp, POST /auth/verify-otp — code generation, SHA-256 hashing, email sending |
| 3 | Backend: JWT tokens | Token generation, verification, refresh token rotation |
| 4 | Backend: Auth middleware | authMiddleware (JWT verify), rbacMiddleware (permission check) |
| 5 | Frontend: Login page | Login form, error handling, loading states |
| 6 | Frontend: OTP verification page | 6-digit input, auto-advance, paste support, resend timer |
| 7 | Frontend: Auth context | AuthProvider, useAuth hook, ProtectedRoute component |
| 8 | **Milestone: M2** | ✅ Full auth flow working: login → OTP → JWT → dashboard redirect |

### Auth Flow Test

```bash
# Test: Login → OTP → Dashboard
1. POST /auth/login → get userId + requiresOtp
2. POST /auth/send-otp → receive code (dev mode shows it)
3. POST /auth/verify-otp → receive accessToken + refreshToken cookie
4. GET /auth/me → user profile with permissions
5. Frontend should redirect to /dashboard
```

---

### Week 3: Dashboard & User Profile

| Day | Task | Details |
|-----|------|---------|
| 1 | Backend: Dashboard stats endpoint | Aggregated KPIs from all modules |
| 2 | Backend: Profile management | GET/PUT /auth/me, PUT /auth/change-password |
| 3 | Frontend: Dashboard page | KPI cards, quick links, recent activity |
| 4 | Frontend: Main layout | Header, Sidebar, Footer — responsive |
| 5 | Frontend: User profile pages | Profile edit, change password, preferences |
| 6 | Frontend: Sidebar integration | Dynamic menu filtered by permissions |
| 7 | Integration testing | Full scenario: login → dashboard → profile edit → logout |
| 8 | **Milestone: M3** | ✅ Dashboard + profile working, sidebar reflecting permissions |

---

## 4. Phase 2: Core Frontend

**Duration:** 3 weeks (Weeks 4-6)

### Week 4: Shared UI Components

| Day | Task | Details |
|-----|------|---------|
| 1 | `DataTable` component | Sortable columns, pagination, loading, empty states |
| 2 | `FormField` + `Modal` components | Form inputs with validation, modal dialogs |
| 3 | `StatusBadge` + `LoadingSpinner` | Color-coded badges, spinner overlay |
| 4 | `AcademicYearSelector` component | Year-switching dropdown, current year indicator |
| 5 | `ProtectedRoute` + RBAC helpers | Route guard, conditional UI rendering |
| 6 | Frontend service layer | Axios interceptors, API service modules |
| 7 | Styling system | CSS variables, theme, responsive breakpoints |
| 8 | **Milestone: M4** | ✅ Shared component library ready for module pages |

### Week 5: Student Information System

| Day | Task | Details |
|-----|------|---------|
| 1 | Backend: Student CRUD endpoints | List, get, create, update, delete |
| 2 | Backend: Student promotion | Bulk promote to next year with target class |
| 3 | Backend: Student export | CSV generation with UTF-8 BOM |
| 4 | Frontend: Student list page | Searchable table, KPI cards, export button |
| 5 | Frontend: Student add page | 3-step wizard (Personal → Academic → Contacts) |
| 6 | Frontend: Student edit + promote | Edit with academic records, promote page |
| 7 | Testing + bug fixes | Edge cases: duplicate admission no, invalid data |
| 8 | **Milestone: M5** | ✅ Student module fully functional (matches PHP prototype) |

### Week 6: Staff + Tasks Modules

| Day | Task | Details |
|-----|------|---------|
| 1 | Backend: Staff CRUD endpoints | List, get, create, update, delete |
| 2 | Backend: Staff photo upload | File upload with multer, validation, preview |
| 3 | Backend: Staff copy-forward | Bulk copy to new academic year |
| 4 | Frontend: Staff pages | List, add (3-tab form), edit, copy-forward |
| 5 | Backend: Tasks CRUD + status | Task endpoints with status transitions |
| 6 | Frontend: Task pages | Board view, add/edit, quick status update |
| 7 | Integration testing | Staff + tasks end-to-end |
| 8 | **Milestone: M6** | ✅ Staff + Tasks modules fully functional |

---

## 5. Phase 3: Finance Module

**Duration:** 4 weeks (Weeks 7-10)

### Week 7-8: Finance Backend

| Day | Task | Details |
|-----|------|---------|
| 1 | Fee structure CRUD | Rate card upsert, matrix endpoint |
| 2 | Fee structure matrix | Get rate card by year, level, term |
| 3 | Invoice batch generation | Generate invoices from rate card + sponsorships |
| 4 | Invoice CRUD + status management | List, detail, void, overdue tracking |
| 5 | Payment recording | Installment tracking, max 3 per invoice, balance calc |
| 6 | Sponsorships CRUD | Sponsor assignment per student per year |
| 7 | Reports aggregation | Collection by term/level, top outstanding |
| 8 | Student statement | Per-student balance: term/year/3-year cycle |

### Week 9-10: Finance Frontend

| Day | Task | Details |
|-----|------|---------|
| 1 | Finance dashboard | KPI cards, recent payments, quick links |
| 2 | Fee structure page | Matrix display with inline editing |
| 3 | Invoice management | List/filter, batch generate, detail view |
| 4 | Receive payment page | Student search, invoice selection, payment form |
| 5 | Sponsorships page | Student search, sponsor assignment |
| 6 | Reports page | Chart.js visualizations, filters |
| 7 | Student statement page | Scope selection (term/year/cycle) |
| 8 | **Milestone: M7** | ✅ Finance module fully functional |

---

## 6. Phase 4: Testing, Optimization, Deployment

**Duration:** 3 weeks (Weeks 11-13)

### Week 11: Testing

| Day | Task | Details |
|-----|------|---------|
| 1-2 | Backend unit tests | Jest + Supertest for all endpoints |
| 3-4 | Backend integration tests | Auth flow, CRUD operations, edge cases |
| 5-6 | Frontend component tests | React Testing Library for key pages |
| 7 | E2E testing | Cypress/Playwright for critical flows |

### Week 12: Optimization

| Day | Task | Details |
|-----|------|---------|
| 1-2 | Database optimization | Query analysis, index tuning, EXPLAIN plans |
| 3-4 | API performance | Response caching, pagination optimization |
| 5-6 | Frontend performance | Code splitting, lazy loading, bundle analysis |
| 7 | Accessibility audit | WCAG compliance, keyboard navigation, screen readers |

### Week 13: Deployment & Documentation

| Day | Task | Details |
|-----|------|---------|
| 1-2 | Production configuration | Environment variables, secrets, SSL |
| 3 | Docker deployment | docker-compose for production |
| 4-5 | CI/CD pipeline | GitHub Actions: lint → test → build → deploy |
| 6 | Final documentation | API docs, deployment guide, handover notes |
| 7 | **Milestone: M8** | ✅ **Production-ready deployment** |

---

## 7. Key Milestones Summary

| Milestone | Delivery | Week | Status |
|-----------|----------|------|--------|
| **M1** | Project scaffold + DB running | 1 | 📝 |
| **M2** | Auth flow working | 2 | 📝 |
| **M3** | Dashboard + profile + sidebar | 3 | 📝 |
| **M4** | Shared component library | 4 | 📝 |
| **M5** | Student module complete | 5 | 📝 |
| **M6** | Staff + Tasks complete | 6 | 📝 |
| **M7** | Finance module complete | 10 | 📝 |
| **M8** | Production-ready deployment | 13 | 📝 |

---

## 8. Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Data migration complexity** | High | Medium | Keep PHP prototype running in parallel; manual data export/import |
| **JWT security issues** | High | Low | Use well-audited libraries (jsonwebtoken); follow security best practices |
| **MySQL connection pool exhaustion** | Medium | Low | Set proper pool limits; monitor with logging |
| **React learning curve** | Medium | Medium | Start with simple components; follow templates in CONTRIBUTING.md |
| **Finance calculation errors** | High | Medium | Write comprehensive unit tests; compare with PHP outputs |
| **Feature creep** | Medium | High | Strictly follow SRD; defer enhancements to v2.0 |
| **Deployment environment differences** | Medium | Medium | Use Docker for consistent environments |

---

## 9. Comparison: Before vs After

| Aspect | PHP Prototype (master) | Node.js + React (new branch) |
|--------|----------------------|------------------------------|
| **Backend** | PHP 8.0, file-based routing | Node.js 20.x, Express REST API |
| **Frontend** | Server-rendered Bootstrap 5 | React SPA with Vite |
| **Database** | MySQL 5.7, implicit FKs | MySQL 8.0, explicit FKs + constraints |
| **Auth** | Session-based + OTP | JWT (access + refresh tokens) + OTP |
| **API** | File-based (no standard format) | RESTful with consistent JSON responses |
| **Permissions** | Binary (view/no-view) | Granular CRUD per module |
| **State** | $_SESSION global | React Context |
| **Testing** | None | Jest + Supertest + React Testing Library |
| **Deployment** | Apache/XAMPP | Node process (PM2) + Nginx |
| **Audit Trail** | Login only | Full CRUD audit log |
| **Soft Deletes** | No | Yes (deleted_at) |

---

## 10. Getting Started

### For Developers Starting Now

If you're joining the migration at this point:

1. **Read the documentation:**
   - `README.md` — System overview
   - `docs/ARCHITECTURE.md` — How the system works
   - `docs/CONTRIBUTING.md` — How to build modules

2. **Set up your environment:**
   - Follow `docs/SETUP.md`

3. **Check the current milestone:**
   - We're at **Phase 0** → Moving to **Phase 1**
   - Next task: Database schema implementation

4. **Start contributing:**
   - Phase 1 tasks are the highest priority
   - Focus on: database migrations, auth system, project scaffolding
