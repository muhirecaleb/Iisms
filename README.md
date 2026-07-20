# 🏫 IISMS — Intango Integrated School Management System

> **Branch:** `nodejs-react-migration`
> **Stack:** Node.js + React.js + MySQL
> **Status:** 🚧 Migration in Progress — Architecture & Documentation Phase

## 📋 Table of Contents

- [1. Overview](#1-overview)
- [2. Why Node.js + React?](#2-why-nodejs--react)
- [3. Project Structure](#3-project-structure)
- [4. Technology Stack](#4-technology-stack)
- [5. Features at a Glance](#5-features-at-a-glance)
- [6. Quick Start](#6-quick-start)
- [7. Modules Overview](#7-modules-overview)
- [8. Migration Roadmap](#8-migration-roadmap)
- [9. Development Guidelines](#9-development-guidelines)
- [10. Documentation Index](#10-documentation-index)

---

## 1. Overview

**IISMS (Intango Integrated School Management System)** is a comprehensive school management platform designed for Intango Technical Secondary School (TSS) in Rwanda. This branch represents the **complete re-architecture** of the original PHP prototype into a modern, scalable, and maintainable **Node.js + React.js** stack with a redesigned MySQL database.

The system provides role-based access to school management functions including student registration, staff management, finance/accounting, task management, and many more modules following Rwanda's TVET (Technical and Vocational Education and Training) school structure.

### Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Auth UI  │ │ Dashboard│ │ Modules  │ │ Shared UI   │  │
│  │          │ │          │ │ Pages    │ │ Components  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘  │
│       └────────────┴────────────┴───────────────┘         │
│                         │ Axios HTTP                       │
│                    JWT Token 🔐                           │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                  Backend (Node.js)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ REST API │ │ JWT Auth │ │ RBAC     │ │ Validators   │  │
│  │ Router   │ │ Middleware│ │ Middlew. │ │ (Joi/Zod)    │  │
│  └────┬─────┘ └──────────┘ └──────────┘ └──────────────┘  │
│       │                                                    │
│  ┌────▼────────────────────────────────────────────────┐   │
│  │  Service Layer (Business Logic)                     │   │
│  │  Students │ Staff │ Finance │ Tasks │ System        │   │
│  └────┬────────────────────────────────────────────────┘   │
│       │                                                    │
│  ┌────▼────────────────────────────────────────────────┐   │
│  │  Data Access Layer (MySQL2 + connection pool)        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                    MySQL Database                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Core     │ │ Students │ │ Finance  │ │ HR/Tasks     │  │
│  │ System   │ │          │ │          │ │              │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Why Node.js + React?

| Concern | PHP (Original) | Node.js + React (New) |
|---------|---------------|----------------------|
| **Language** | PHP 8.0 | JavaScript/TypeScript (universal language) |
| **Frontend** | Server-rendered (Bootstrap) | SPA with React 18+ |
| **API Style** | File-based routing | RESTful API with Express |
| **Authentication** | Session-based + OTP | JWT (access + refresh tokens) |
| **State Management** | $_SESSION global | React Context / Redux |
| **Realtime** | No | WebSocket (Socket.io for notifications) |
| **Type Safety** | None | TypeScript (optional, strongly recommended) |
| **Testing** | Manual | Jest, React Testing Library, Supertest |
| **Package Mgmt** | Composer (not used) | npm / yarn |
| **Deployment** | Apache / php -S | Node process (PM2 / Docker) |
| **Developer Experience** | Mixed HTML/PHP | Component-based, hot reload |

---

## 3. Project Structure

```
iisms/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js     # MySQL2 connection pool
│   │   │   ├── environment.js  # Environment variables
│   │   │   └── cors.js         # CORS configuration
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification
│   │   │   ├── rbac.js         # Role-based access control
│   │   │   ├── validate.js     # Request validation
│   │   │   ├── errorHandler.js # Global error handler
│   │   │   └── yearContext.js  # Academic year context
│   │   ├── modules/
│   │   │   ├── auth/           # Authentication module
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── students/       # Student Information System
│   │   │   ├── staff/          # Human Resources
│   │   │   ├── finance/        # Finance module
│   │   │   │   ├── fee-structure/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── sponsorships/
│   │   │   │   └── reports/
│   │   │   ├── tasks/          # Task management
│   │   │   ├── academic-years/ # Academic year management
│   │   │   ├── classes/        # Class management
│   │   │   ├── dashboard/      # Dashboard statistics
│   │   │   └── system/         # System settings
│   │   │       ├── roles/
│   │   │       ├── users/
│   │   │       └── modules/
│   │   ├── utils/
│   │   │   ├── helpers.js      # Shared utilities
│   │   │   ├── logger.js       # Winston logger
│   │   │   ├── errors.js       # Custom error classes
│   │   │   └── constants.js    # Shared constants
│   │   ├── routes/
│   │   │   └── index.js        # Route aggregator
│   │   └── app.js              # Express app setup
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── common/
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── FormField.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   └── shared/
│   │   │       ├── CategoryManager.jsx
│   │   │       ├── AcademicYearSelector.jsx
│   │   │       └── StudentWizard.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── VerifyOTPPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── students/
│   │   │   │   ├── StudentListPage.jsx
│   │   │   │   ├── StudentAddPage.jsx
│   │   │   │   ├── StudentEditPage.jsx
│   │   │   │   ├── StudentPromotePage.jsx
│   │   │   │   └── StudentExportPage.jsx
│   │   │   ├── staff/
│   │   │   │   ├── StaffListPage.jsx
│   │   │   │   ├── StaffAddPage.jsx
│   │   │   │   └── StaffEditPage.jsx
│   │   │   ├── finance/
│   │   │   │   ├── FinanceDashboardPage.jsx
│   │   │   │   ├── FeeStructurePage.jsx
│   │   │   │   ├── InvoicesPage.jsx
│   │   │   │   ├── ReceivePaymentPage.jsx
│   │   │   │   ├── SponsorshipsPage.jsx
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   └── StudentStatementPage.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskBoardPage.jsx
│   │   │   │   └── TaskFormPage.jsx
│   │   │   ├── settings/
│   │   │   │   ├── AcademicYearsPage.jsx
│   │   │   │   ├── RolesPage.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   └── error/
│   │   │       ├── NotFoundPage.jsx
│   │   │       └── ForbiddenPage.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useAcademicYear.js
│   │   │   ├── usePagination.js
│   │   │   └── useForm.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── YearContext.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance with interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── student.service.js
│   │   │   ├── staff.service.js
│   │   │   ├── finance.service.js
│   │   │   ├── task.service.js
│   │   │   └── system.service.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   ├── permissions.js
│   │   │   └── modules.js         # Module registry for sidebar
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── database/                   # Database migration files
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_seed_data.sql
│   │   └── 003_demo_accounts.sql
│   └── README.md
│
├── docs/                        # Documentation (see Section 10)
├── .gitignore
├── .nvmrc                       # Node version specification
├── docker-compose.yml           # MySQL + Node.js containers
└── README.md                    # This file
```

---

## 4. Technology Stack

### Backend (Node.js)

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 20.x LTS |
| **Express.js** | HTTP framework | 4.x |
| **MySQL2** | Database driver (promise-based) | 3.x |
| **JWT (jsonwebtoken)** | Access + refresh tokens | 9.x |
| **bcrypt** | Password hashing | 5.x |
| **Joi / Zod** | Request validation | Latest |
| **Winston** | Logging | 3.x |
| **dotenv** | Environment variables | 16.x |
| **helmet** | Security headers | 7.x |
| **cors** | Cross-origin resource sharing | 2.x |
| **express-rate-limit** | Rate limiting | 7.x |
| **nodemailer** | Email (OTP) | 6.x |
| **multer** | File uploads | 1.x |
| **morgan** | HTTP request logging | 1.x |

### Frontend (React)

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework | 18.x |
| **React Router** | Client-side routing | 6.x |
| **Axios** | HTTP client | 1.x |
| **React Context API** | State management | Built-in |
| **Vite** | Build tool / dev server | 5.x |
| **ESLint + Prettier** | Code quality | Latest |
| **Tailwind CSS** (or **MUI**) | Styling | Latest |
| **Recharts / Chart.js** | Charts & graphs | Latest |
| **React Hook Form** | Form management | Latest |
| **react-hot-toast** | Notifications | Latest |
| **date-fns** | Date utilities | Latest |

### Database (MySQL)

| Feature | Version |
|---------|---------|
| **MySQL** | 8.0+ |
| **Charset** | utf8mb4 |
| **Engine** | InnoDB (with Foreign Keys) |
| **Migration Tool** | Custom SQL scripts / Knex.js |

### Developer Tools

| Tool | Purpose |
|------|---------|
| **Postman / Insomnia** | API testing |
| **Docker** | Containerized development |
| **PM2** | Production process manager |
| **Jest + Supertest** | Backend testing |
| **React Testing Library** | Frontend testing |
| **Git + GitHub** | Version control |

---

## 5. Features at a Glance

### ✅ Core System Features (Planned)

| Feature | Description | Status |
|---------|-------------|--------|
| **JWT Authentication** | Access token (15min) + Refresh token (7d) with httpOnly cookies | 📝 Planned |
| **Two-Factor Auth (OTP)** | Email-based OTP with rate limiting and SHA-256 hashing | 📝 Planned |
| **Role-Based Access Control** | 11+ roles with module-level permissions | 📝 Planned |
| **Academic Year Navigation** | Switch years, historical data browsing with visual indicators | 📝 Planned |
| **RESTful API** | Clean, versioned API (`/api/v1/...`) with consistent responses | 📝 Planned |
| **Multi-Year Records** | Students and Staff tracked per academic year via link tables | 📝 Planned |
| **File Uploads** | Staff/Student photos with validation and cloud storage support | 📝 Planned |
| **CSV Export/Import** | Student data export with potential bulk import | 📝 Planned |
| **Audit Trail** | Comprehensive activity logging across all modules | 📝 Planned |
| **Realtime Notifications** | WebSocket-based alerts for task assignments, payment reminders | 📝 Planned |
| **Dark Mode** | Theme toggle with persistent preference | 📝 Planned |
| **Responsive SPA** | Mobile-first design with offline-capable PWA support | 📝 Planned |

### ✅ Feature Modules (Planned)

| Module | Description | Status |
|--------|-------------|--------|
| **Student Information System** | Registration wizard, promotion, CSV export, contact management | 📝 Planned |
| **Human Resources** | Staff registration, photo upload, copy-forward between years | 📝 Planned |
| **Finance** | Fee structure, invoices, payments, sponsorships, reports with charts | 📝 Planned |
| **Tasks** | Cross-module assignment, priority levels, status tracking | 📝 Planned |
| **Academic Management** | Calendar, timetable, subjects, marks, assessments, report cards | 📝 Planned |
| **Learning Management** | Materials, assignments, online assessments | 📝 Planned |
| **Library** | Books, borrowing, returns, digital resources | 📝 Planned |
| **Inventory** | Assets, equipment, computers, furniture, consumables | 📝 Planned |
| **Document Management** | Policies, reports, photos, videos, strategic plan | 📝 Planned |
| **Quality Assurance** | NESA indicators, evidence management, internal audit | 📝 Planned |
| **Student Welfare** | Discipline, counselling, health, clubs, boarding, safeguarding | 📝 Planned |
| **Graduate Tracer** | Employment tracking, employer records | 📝 Planned |
| **Volunteers** | Profiles, assignments, performance | 📝 Planned |
| **Partnerships** | Organizations, contacts, agreements, donations | 📝 Planned |
| **Projects** | DSE, Bridge, Holiday Bootcamps, Short Courses | 📝 Planned |

---

## 6. Quick Start

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Node.js** | 20.x LTS | `node --version` |
| **npm** | 10.x | `npm --version` |
| **MySQL** | 8.0+ | `mysql --version` |
| **Git** | Latest | `git --version` |

### Setup Commands

```bash
# 1. Clone the repository
git clone <repo-url> iisms
cd iisms

# 2. Switch to migration branch
git checkout nodejs-react-migration

# 3. Set up the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS iisms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p iisms < database/migrations/001_initial_schema.sql
mysql -u root -p iisms < database/migrations/002_seed_data.sql
mysql -u root -p iisms < database/migrations/003_demo_accounts.sql

# 4. Configure backend environment
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# 5. Install backend dependencies & start
npm install
npm run dev        # Starts on http://localhost:3001

# 6. In a new terminal — configure & start frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev        # Starts on http://localhost:5173
```

### Environment Variables

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=iisms
DB_USER=root
DB_PASS=

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP
OTP_DEV_MODE=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=2097152
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_APP_NAME=IISMS
```

---

## 7. Modules Overview

| Module Key | Category | Priority | Backend | Frontend |
|-----------|----------|----------|---------|----------|
| `auth` | System | 🔴 P0 | `backend/src/modules/auth/` | `frontend/src/pages/auth/` |
| `dashboard` | System | 🔴 P0 | `backend/src/modules/dashboard/` | `frontend/src/pages/dashboard/` |
| `students` | Academic Program | 🔴 P0 | `backend/src/modules/students/` | `frontend/src/pages/students/` |
| `staff` | General Admin | 🔴 P0 | `backend/src/modules/staff/` | `frontend/src/pages/staff/` |
| `finance` | General Admin | 🔴 P0 | `backend/src/modules/finance/` | `frontend/src/pages/finance/` |
| `tasks` | Tasks | 🔴 P0 | `backend/src/modules/tasks/` | `frontend/src/pages/tasks/` |
| `academic` | Academic Program | 🟡 P1 | — | — |
| `academic-years` | Settings | 🔴 P0 | `backend/src/modules/academic-years/` | `frontend/src/pages/settings/` |

**Priority Levels:**
- **🔴 P0** — Must have (core system + 5 feature modules)
- **🟡 P1** — Should have (next phase)
- **🟢 P2** — Nice to have (future phases)

---

## 8. Migration Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 0** | ✅ Architecture & Documentation | **Current** |
| **Phase 1** | 🔧 Database schema + migrations + seed data | 📝 Planned |
| **Phase 2** | 🔧 Backend: Auth system (login, OTP, JWT) | 📝 Planned |
| **Phase 3** | 🔧 Frontend: Auth pages, layout, routing | 📝 Planned |
| **Phase 4** | 🔧 Backend + Frontend: Dashboard | 📝 Planned |
| **Phase 5** | 🔧 Backend + Frontend: Student Information System | 📝 Planned |
| **Phase 6** | 🔧 Backend + Frontend: Human Resources | 📝 Planned |
| **Phase 7** | 🔧 Backend + Frontend: Finance (core) | 📝 Planned |
| **Phase 8** | 🔧 Backend + Frontend: Tasks | 📝 Planned |
| **Phase 9** | 🧪 Testing, optimization, deployment | 📝 Planned |
| **Phase 10** | 🚀 Production deployment | 📝 Planned |

> 📖 See [docs/ROADMAP.md](docs/ROADMAP.md) for detailed migration plan.

---

## 9. Development Guidelines

### API Conventions

- **Base URL:** `/api/v1`
- **Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operation successful",
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- **Error Format:**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "details": [{ "field": "email", "message": "Invalid email" }]
    }
  }
  ```

### Authentication

- **Access Token:** JWT, 15-minute expiry, sent in `Authorization: Bearer <token>` header
- **Refresh Token:** JWT, 7-day expiry, stored in httpOnly cookie
- **OTP:** 6-digit code, SHA-256 hashed, 10-minute expiry, max 5 attempts

### Code Style

- **Backend:** ES6+ modules (import/export), async/await throughout
- **Frontend:** Functional components with hooks
- **Validation:** Joi (backend) + React Hook Form (frontend)
- **Error Handling:** Global error handler middleware in Express
- **Logging:** Winston with different levels per environment

### Testing Strategy

- **Backend:** Unit tests (Jest) + Integration tests (Supertest)
- **Frontend:** Component tests (React Testing Library)
- **CI/CD:** GitHub Actions (lint → test → build → deploy)

---

## 10. Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture Guide](docs/ARCHITECTURE.md) | Complete system architecture, data flow, design patterns |
| [Database Schema](docs/DATABASE.md) | New MySQL schema with all tables, indexes, and relationships |
| [Module Reference](docs/MODULES.md) | All 16 modules with endpoints, components, and patterns |
| [Roles & Permissions](docs/ROLES-PERMISSIONS.md) | RBAC matrix, role definitions, permission helpers |
| [API Reference](docs/API-REFERENCE.md) | All REST API endpoints with request/response examples |
| [Contributing Guide](docs/CONTRIBUTING.md) | How to build modules in the new stack |
| [Setup Guide](docs/SETUP.md) | Detailed setup instructions for Node.js + React + MySQL |
| [Migration Roadmap](docs/ROADMAP.md) | Phase-by-phase migration plan from PHP to new stack |

---

## License

**Intango Integrated School Management System (IISMS)** · Holiday Student Project 2026 · Educational Project

---

*This branch (`nodejs-react-migration`) represents the re-architecture from the original PHP prototype. See the `master` branch for the original PHP implementation.*
