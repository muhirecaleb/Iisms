# 🏗️ IISMS System Architecture — Node.js + React + MySQL

> **Branch:** `nodejs-react-migration`
> **Stack:** Node.js 20.x (Express) + React 18.x (Vite) + MySQL 8.0
> **Status:** Architecture & Documentation Phase

---

## 1. Architecture Overview

IISMS follows a **three-tier architecture** with a clear separation of concerns:

1. **Frontend (React SPA)** — Client-side rendering, state management, UI
2. **Backend (Node.js + Express)** — RESTful API, business logic, authentication
3. **Database (MySQL)** — Data persistence, relationships, constraints

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    React SPA (Vite)                          │    │
│  │  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐ │    │
│  │  │ Auth UI   │ │ Dashboard │ │ Module   │ │ Shared UI    │ │    │
│  │  │ Pages     │ │ Page      │ │ Pages    │ │ Components   │ │    │
│  │  └─────┬─────┘ └─────┬─────┘ └────┬─────┘ └──────┬───────┘ │    │
│  │        └──────────────┴───────────┴───────────────┘         │    │
│  │                         │ Axios                              │    │
│  │                   JWT Token (Bearer)                         │    │
│  └─────────────────────────┬───────────────────────────────────┘    │
│                            │ HTTP/HTTPS                             │
└────────────────────────────┼───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                      API GATEWAY (Express)                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Middleware Pipeline                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │  CORS    │ │ Helmet   │ │ Rate     │ │ Request Logger   │  │   │
│  │  │          │ │ (Security)│ │ Limiter  │ │ (Morgan)         │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │ JWT Auth │ │  RBAC    │ │Year      │ │ Validator        │  │   │
│  │  │          │ │  Check   │ │Context   │ │ (Joi/Zod)        │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                             │                                        │
│  ┌─────────────────────────▼────────────────────────────────────┐   │
│  │                    Route Modules                               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │ /auth/*  │ │/students*│ │ /staff/* │ │ /finance/*       │  │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────────┘  │   │
│  │       │            │            │               │              │   │
│  │  ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌──────▼───────────┐  │   │
│  │  │ Controller│ │Controller│ │Controller│ │  Controller     │  │   │
│  │  │ Service   │ │ Service  │ │ Service  │ │  Service        │  │   │
│  │  │ Validation│ │ Validation│ │ Validation│ │  Validation    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                             │                                        │
│  ┌─────────────────────────▼────────────────────────────────────┐   │
│  │                   Data Access Layer                            │   │
│  │  ┌───────────────────────────────────────────────────────────┐│   │
│  │  │  MySQL2 Connection Pool (Promise-based)                   ││   │
│  │  │  • Connection pooling (default: 10 connections)          ││   │
│  │  │  • Prepared statements (SQL injection prevention)        ││   │
│  │  │  • Transaction support for multi-table operations        ││   │
│  │  └───────────────────────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                       MySQL Database                                │
│                                                                      │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │
│  │   Core        │ │   Students    │ │   Finance     │             │
│  │   System      │ │   & Staff     │ │   & Tasks     │             │
│  │               │ │               │ │               │             │
│  │ • users       │ │ • students    │ │ • fee_items   │             │
│  │ • roles       │ │ • student_    │ │ • fee_        │             │
│  │ • modules     │ │   academic_   │ │   structures  │             │
│  │ • role_       │ │   records     │ │ • invoices    │             │
│  │   permissions │ │ • student_    │ │ • payments    │             │
│  │ • login_logs  │ │   contacts    │ │ • student_    │             │
│  │ • otp_codes   │ │ • student_    │ │   sponsorships│             │
│  │ • academic_   │ │   sponsorships│ │ • tasks       │             │
│  │   years       │ │ • staff       │ │               │             │
│  │ • terms       │ │ • staff_      │ │               │             │
│  │ • classes     │ │   academic_   │ │               │             │
│  │               │ │   years       │ │               │             │
│  └───────────────┘ └───────────────┘ └───────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle

### 2.1 Full Request Flow

```
Browser URL Change
  │
  ├── React Router matches path
  │     │
  │     ├── ProtectedRoute checks AuthContext
  │     │     ├── Has valid token? → Continue
  │     │     └── No token? → Redirect to /login
  │     │
  │     ├── Page component mounts
  │     │     ├── useEffect → calls API service function
  │     │     └── API service → Axios interceptor attaches JWT
  │     │
  │     └── Axios sends HTTP request
  │
  ├── Express receives request
  │     │
  │     ├── Middleware chain
  │     │     ├── cors() → Allow frontend origin
  │     │     ├── helmet() → Security headers
  │     │     ├── rateLimit() → Prevent abuse
  │     │     ├── morgan() → Log request
  │     │     └── express.json() → Parse body
  │     │
  │     ├── Route matched (e.g., GET /api/v1/students)
  │     │     ├── authMiddleware → Verify JWT, attach user to req
  │     │     ├── rbacMiddleware → Check module permission
  │     │     ├── yearMiddleware → Attach selected academic year
  │     │     └── validationMiddleware → Validate params/body
  │     │
  │     ├── Controller handles request
  │     │     ├── Extract params from req
  │     │     ├── Call service layer
  │     │     └── Send JSON response
  │     │
  │     ├── Service executes business logic
  │     │     ├── Call data access methods
  │     │     ├── Apply transformations
  │     │     └── Return result
  │     │
  │     └── Response sent as JSON
  │
  └── Frontend receives response
        ├── Axios interceptor catches response
        │     ├── 401? → Try refresh token, else redirect to login
        │     └── Other error? → Show toast notification
        │
        └── Component updates state → Re-renders UI
```

### 2.2 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │     │  OTP     │     │  JWT     │     │  API     │
│  Page    │────→│  Verify  │────→│  Issued  │────→│  Access  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │ POST           │ POST           │ Store in       │ Auth header
     │ /api/v1/       │ /api/v1/       │ httpOnly        │ Bearer token
     │ auth/login     │ auth/verify-   │ cookie +        │
     │                │ otp            │ memory          │
     ▼                ▼                ▼                ▼
{
  "username":       {
  "admin",            "otp_code":
  "password":         "123456"
  "secret"
}
                  }
                                  ┌──────────────────────┐
                                  │ JWT Payload          │
                                  │ {                    │
                                  │   sub: user_id,      │
                                  │   username: "admin", │
                                  │   role: "Admin",     │
                                  │   permissions: [...],│
                                  │   iat, exp           │
                                  │ }                    │
                                  └──────────────────────┘
```

### 2.3 Token Refresh Flow

```
1. Access token expires (401 response)
2. Axios interceptor detects 401
3. Interceptor calls POST /api/v1/auth/refresh
     ├── Sends refresh token from httpOnly cookie
     ├── Server validates refresh token
     ├── Server issues new access token + new refresh token (rotation)
     └── Returns new access token
4. Interceptor retries original request with new token
5. If refresh fails → Clear auth state → Redirect to /login
```

---

## 3. Module Architecture (Feature-Based)

Each module follows a consistent **Controller → Service → Data Access** pattern:

```
backend/src/modules/{module_name}/
├── {module}.controller.js    # Request handling, HTTP concerns
├── {module}.service.js       # Business logic
├── {module}.routes.js        # Route definitions + middleware binding
├── {module}.validation.js    # Joi schemas for request validation
└── {module}.test.js          # Tests (co-located with module)
```

### 3.1 Controller Layer

Responsible for:
- Extracting data from `req.params`, `req.query`, `req.body`
- Calling service methods
- Formatting and sending HTTP responses
- Catching errors and passing to error handler via `next(error)`

**Pattern:**
```javascript
// students.controller.js
const studentService = require('./students.service');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, yearId } = req.query;
    const result = await studentService.list({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      yearId: yearId || req.academicYearId,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const student = await studentService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};
```

### 3.2 Service Layer

Responsible for:
- Business logic and validation
- Data transformation and aggregation
- Orchestrating multiple data access calls
- Transaction management for multi-table operations

**Pattern:**
```javascript
// students.service.js
const db = require('../../config/database');

exports.list = async ({ page, limit, search, yearId }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT s.*, c.class_name, c.level, c.trade
    FROM students s
    JOIN student_academic_records sar ON s.student_id = sar.student_id
    JOIN classes c ON sar.class_id = c.class_id
    WHERE sar.academic_year_id = ?
  `;
  const params = [yearId];

  if (search) {
    query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await db.query(query, params);
  return { data: rows, pagination: { page, limit, total: rows.length } };
};
```

### 3.3 Data Access Layer

MySQL2 is used directly (no ORM) for:
- Full control over queries
- Optimal performance
- Prepared statements for SQL injection prevention
- Connection pooling

**Database Config Pattern:**
```javascript
// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

module.exports = pool;
```

---

## 4. Frontend Architecture

### 4.1 Component Tree

```
<App>
  ├── <AuthProvider>
  │     └── <YearProvider>
  │           └── <BrowserRouter>
  │                 ├── <Routes>
  │                 │     ├── <Route path="/login" element={<LoginPage />} />
  │                 │     ├── <Route path="/verify-otp" element={<VerifyOTPPage />} />
  │                 │     ├── <ProtectedRoute>  (requires auth)
  │                 │     │     └── <MainLayout>  (Header + Sidebar + Content)
  │                 │     │           ├── <Route path="/" element={<DashboardPage />} />
  │                 │     │           ├── <Route path="/students/*" element={<StudentRoutes />} />
  │                 │     │           ├── <Route path="/staff/*" element={<StaffRoutes />} />
  │                 │     │           ├── <Route path="/finance/*" element={<FinanceRoutes />} />
  │                 │     │           ├── <Route path="/tasks/*" element={<TaskRoutes />} />
  │                 │     │           └── <Route path="/settings/*" element={<SettingsRoutes />} />
  │                 │     └── </ProtectedRoute>
  │                 │     └── <Route path="*" element={<NotFoundPage />} />
  │                 └── </Routes>
  └── </BrowserRouter>
```

### 4.2 State Management

| Context | Purpose | Key Values |
|---------|---------|------------|
| **AuthContext** | Authentication state | `user`, `token`, `permissions`, `login()`, `logout()` |
| **YearContext** | Academic year browsing | `selectedYear`, `setSelectedYear()`, `isCurrentYear` |

**AuthContext Pattern:**
```javascript
// context/AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for stored refresh token
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('accessToken', response.accessToken);
    // Refresh token stored in httpOnly cookie (invisible to JS)
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setToken(null);
    authService.logout(); // Clears refresh token cookie
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 4.3 API Service Pattern

```javascript
// services/api.js — Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // For httpOnly cookies (refresh token)
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4.4 Frontend Service Module

```javascript
// services/student.service.js
import api from './api';

export const studentService = {
  list: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  promote: (data) => api.post('/students/promote', data),
  export: (params) => api.get('/students/export', { params, responseType: 'blob' }),
};
```

---

## 5. Middleware Pipeline

### 5.1 Global Middleware (applied to all routes)

| Middleware | Order | Purpose |
|-----------|-------|---------|
| `cors()` | 1 | Allow frontend origin, credentials |
| `helmet()` | 2 | Security headers (CSP, XSS, etc.) |
| `express.json()` | 3 | Parse JSON request bodies |
| `express.urlencoded()` | 4 | Parse URL-encoded bodies |
| `morgan()` | 5 | HTTP request logging |
| `rateLimit()` | 6 | Global rate limiting |
| `errorHandler()` | Last | Global error handler |

### 5.2 Route-Level Middleware

| Middleware | Applied To | Purpose |
|-----------|-----------|---------|
| `authMiddleware` | All protected routes | Verify JWT, attach `req.user` |
| `rbacMiddleware(moduleKey)` | Module routes | Check user has module permission |
| `yearMiddleware` | Year-aware routes | Attach `req.academicYearId` |
| `validate(schema)` | Specific endpoints | Validate request body/params/query |
| `upload.single('photo')` | File upload endpoints | Handle multipart file upload |
| `rateLimit({ windowMs, max })` | Auth endpoints | Stricter rate limiting for login |

### 5.3 RBAC Middleware

```javascript
// middleware/rbac.js
module.exports = (requiredModule) => {
  return (req, res, next) => {
    const permissions = req.user.permissions || [];

    if (!permissions.includes(requiredModule)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied: ${requiredModule} module required`,
          details: {
            userRole: req.user.role,
            requiredModule,
            userPermissions: permissions,
          },
        },
      });
    }

    next();
  };
};
```

### 5.4 Error Handler

```javascript
// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  const logger = require('../utils/logger');

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Format response
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'Internal server error' : err.message,
      details: err.details || null,
    },
  });
};
```

---

## 6. Key Design Patterns

### 6.1 Module Registration Pattern (Backend)

```javascript
// routes/index.js — Auto-discover and register all modules
const fs = require('fs');
const path = require('path');
const router = require('express').Router();

const MODULES_DIR = path.join(__dirname, '../modules');

// Discover all module directories
const modules = fs.readdirSync(MODULES_DIR);

modules.forEach((moduleName) => {
  const modulePath = path.join(MODULES_DIR, moduleName);
  const stats = fs.statSync(modulePath);

  if (stats.isDirectory()) {
    const routesFile = path.join(modulePath, `${moduleName}.routes.js`);
    if (fs.existsSync(routesFile)) {
      const moduleRouter = require(routesFile);
      router.use(`/${moduleName}`, moduleRouter);
      console.log(`✓ Module registered: /api/v1/${moduleName}`);
    }
  }
});

module.exports = router;
```

### 6.2 Year-Aware Data Pattern

```javascript
// middleware/yearContext.js
module.exports = async (req, res, next) => {
  try {
    // Check header first, then query param, then default to current year
    const yearId = req.headers['x-academic-year-id']
      || req.query.academicYearId
      || req.body.academicYearId;

    if (yearId) {
      req.academicYearId = parseInt(yearId);
    } else {
      // Default to current academic year
      const [rows] = await db.query(
        'SELECT year_id FROM academic_years WHERE is_current = 1 LIMIT 1'
      );
      req.academicYearId = rows[0]?.year_id;
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

### 6.3 Validation Pattern (Joi)

```javascript
// modules/students/students.validation.js
const Joi = require('joi');

exports.createStudent = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid('M', 'F').required(),
  dateOfBirth: Joi.date().iso().required(),
  nationality: Joi.string().max(50).required(),
  // ... additional fields
  contacts: Joi.array().items(Joi.object({
    contactName: Joi.string().required(),
    relationship: Joi.string().valid('Father', 'Mother', 'Guardian', 'Sibling', 'Other').required(),
    phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).required(),
    isPrimary: Joi.boolean(),
    isGuardian: Joi.boolean(),
  })).min(1).required(),
});

exports.updateStudent = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  // All fields optional for partial updates
}).min(1);
```

### 6.4 Transaction Pattern

```javascript
// modules/students/students.service.js
const db = require('../../config/database');

exports.createWithWizard = async (data, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Step 1: Insert student record
    const admissionNo = await generateAdmissionNo(connection);
    const [studentResult] = await connection.query(
      `INSERT INTO students (admission_no, first_name, last_name, gender, date_of_birth, ...)
       VALUES (?, ?, ?, ?, ?, ...)`,
      [admissionNo, data.firstName, data.lastName, data.gender, data.dateOfBirth, ...]
    );
    const studentId = studentResult.insertId;

    // Step 2: Insert academic record
    await connection.query(
      `INSERT INTO student_academic_records (student_id, academic_year_id, class_id, term_id, ...)
       VALUES (?, ?, ?, ?, ...)`,
      [studentId, data.academicYearId, data.classId, data.termId, ...]
    );

    // Step 3: Insert contacts
    for (const contact of data.contacts) {
      await connection.query(
        `INSERT INTO student_contacts (student_id, contact_name, relationship, phone_number, ...)
         VALUES (?, ?, ?, ?, ...)`,
        [studentId, contact.contactName, contact.relationship, contact.phoneNumber, ...]
      );
    }

    await connection.commit();
    return { studentId, admissionNo };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

---

## 7. Frontend Component Architecture

### 7.1 Common Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `DataTable` | `columns`, `data`, `loading`, `onPageChange`, `pagination` | Reusable sortable, searchable table |
| `Modal` | `isOpen`, `onClose`, `title`, `children` | Overlay dialog for confirmations/forms |
| `FormField` | `label`, `name`, `type`, `error`, `register` | Controlled form input with validation |
| `StatusBadge` | `status`, `variant` | Color-coded status indicator |
| `LoadingSpinner` | `size`, `overlay` | Loading indicator |
| `EmptyState` | `icon`, `title`, `description`, `action` | Empty data placeholder |
| `AcademicYearSelector` | `selectedYear`, `onChange`, `years` | Year-switching dropdown |
| `ProtectedRoute` | `module`, `children` | Route guard with RBAC check |

### 7.2 Layout Components

| Component | Purpose |
|-----------|---------|
| `MainLayout` | Main authenticated layout (Header + Sidebar + Content) |
| `Header` | Top bar with user menu, year selector, notifications |
| `Sidebar` | Collapsible navigation filtered by permissions |
| `Footer` | Page footer with version info |

### 7.3 Custom Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useAuth()` | `{ user, token, permissions, login, logout, loading }` | Authentication state |
| `useApi(serviceMethod, params)` | `{ data, loading, error, refetch }` | Generic data fetching |
| `useAcademicYear()` | `{ selectedYear, years, setYear, isCurrentYear }` | Year browsing state |
| `usePagination(initialPage, initialLimit)` | `{ page, limit, setPage, setLimit }` | Pagination state |
| `useForm(initialValues, validationSchema)` | `{ values, errors, handleChange, handleSubmit }` | Form state management |

---

## 8. Response Format Standards

### 8.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 8.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Email is required" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
}
```

### 8.3 Pagination Query Parameters

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number (1-indexed) |
| `limit` | 20 | Items per page (max 100) |
| `search` | — | Search term |
| `sortBy` | `created_at` | Sort column |
| `sortOrder` | `desc` | Sort direction (`asc`/`desc`) |

---

## 9. Security Architecture

### 9.1 Authentication

| Layer | Mechanism |
|-------|-----------|
| **Password storage** | bcrypt with salt rounds (12) |
| **Session management** | JWT (stateless) |
| **Token storage** | Access token in memory/localStorage; Refresh token in httpOnly cookie |
| **OTP** | 6-digit code, SHA-256 hashed, 10-min expiry, max 5 attempts |
| **Rate limiting** | 5 attempts per 15 minutes for login; 3 attempts per 15 minutes for OTP |

### 9.2 API Security

| Measure | Implementation |
|---------|---------------|
| **CORS** | Whitelist frontend origin only |
| **Helmet** | CSP, X-Frame-Options, XSS Filter, etc. |
| **SQL Injection** | MySQL2 prepared statements (parameterized queries) |
| **XSS** | React auto-escapes; Helmet CSP headers |
| **CSRF** | SameSite cookies; token-based auth (no cookie-based session) |
| **Request Validation** | Joi schemas for all endpoints |
| **File Upload** | Type check (JPG/PNG/WEBP), size limit (2MB), virus scanning |

---

## 10. Logging & Monitoring

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'iisms-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;
```
