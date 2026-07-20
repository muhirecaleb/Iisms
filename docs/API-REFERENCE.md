# 📖 IISMS API Reference — Node.js + Express REST API

> **Branch:** `nodejs-react-migration`
> **Base URL:** `http://localhost:3001/api/v1`

---

## 1. API Conventions

### Authentication

All protected endpoints require a valid JWT access token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (resource created) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### Error Codes

| Code | Meaning |
|------|---------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTH_INVALID_CREDENTIALS` | Invalid username or password |
| `AUTH_ACCOUNT_LOCKED` | Account is locked due to too many attempts |
| `AUTH_OTP_INVALID` | Invalid or expired OTP code |
| `AUTH_OTP_MAX_ATTEMPTS` | Maximum OTP attempts exceeded |
| `AUTH_TOKEN_EXPIRED` | Access token has expired |
| `AUTH_TOKEN_INVALID` | Invalid token |
| `FORBIDDEN` | User lacks required module permission |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `BUSINESS_RULE` | Business logic violation |
| `INTERNAL_ERROR` | Server error |

---

## 2. Authentication Endpoints

### `POST /auth/login`

Authenticate user credentials.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
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
    "requiresOtp": true
  }
}
```

**Errors:** `404` — User not found, `401` — Invalid password, `423` — Account locked

---

### `POST /auth/send-otp`

Send OTP code to user's registered email.

**Request:**
```json
{
  "userId": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "maskedEmail": "adm***@iisms.rw",
    "expiresIn": 600,
    "devMode": true,
    "devCode": "123456"
  }
}
```

**Errors:** `429` — Too many OTP requests

---

### `POST /auth/verify-otp`

Verify OTP code and issue JWT tokens.

**Request:**
```json
{
  "userId": 1,
  "otpCode": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "fullName": "Administrator",
      "email": "admin@iisms.rw",
      "role": "Administrator",
      "permissions": ["dashboard", "students", "staff", "finance", "tasks", "academic", "learning", "library", "inventory", "documents", "qa", "welfare", "tracer", "volunteers", "partnerships", "projects"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:** `401` — Invalid OTP, `429` — Max attempts exceeded

---

### `POST /auth/refresh`

Refresh access token. Reads refresh token from httpOnly cookie.

**Cookie:**
```
refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### `POST /auth/logout`

Revoke current refresh token.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `GET /auth/me`

Get current authenticated user's profile and permissions.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@iisms.rw",
    "role": "Administrator",
    "permissions": ["dashboard", "students", "staff", "finance", "tasks", ...],
    "lastLogin": "2026-07-18T08:30:00.000Z"
  }
}
```

---

### `PUT /auth/change-password`

Change password (requires current password).

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 3. Dashboard Endpoints

### `GET /dashboard/stats`

Get aggregated dashboard KPIs for the current academic year.

**Headers:** `X-Academic-Year-Id: 3`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "students": {
      "total": 156,
      "active": 142,
      "male": 89,
      "female": 67,
      "newThisYear": 34,
      "byLevel": {
        "L3": 52,
        "L4": 48,
        "L5": 42
      }
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
      "collectionRate": 72.2,
      "byTerm": {
        "1": { "invoiced": 15000000, "collected": 12000000 },
        "2": { "invoiced": 15000000, "collected": 11000000 },
        "3": { "invoiced": 15000000, "collected": 9500000 }
      }
    },
    "tasks": {
      "pending": 12,
      "inProgress": 5,
      "completed": 45,
      "overdue": 3
    },
    "academicYear": {
      "yearId": 3,
      "label": "2025-2026",
      "currentTerm": "Term 2",
      "isCurrent": true
    }
  }
}
```

---

## 4. Students Endpoints

### `GET /students`

List/search students with pagination and filtering.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `search` | string | — | Search by name/admission no/national code |
| `gender` | string | — | Filter by gender (M/F) |
| `status` | string | — | Filter by status (active/transferred/graduated/dropped) |
| `level` | string | — | Filter by class level (L3/L4/L5) |
| `trade` | string | — | Filter by trade |
| `sortBy` | string | created_at | Sort column |
| `sortOrder` | string | desc | Sort direction (asc/desc) |
| `academicYearId` | int | current | Academic year filter |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "admissionNo": "INT-2026-001",
      "firstName": "Eric",
      "lastName": "Mucyo",
      "gender": "M",
      "dateOfBirth": "2005-03-15",
      "class": "L3 SOD A",
      "level": "L3",
      "trade": "Software Development",
      "status": "active",
      "boardingCategory": "Day",
      "sponsorshipType": "Self"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### `POST /students`

Create a new student (full wizard submission).

**Request Body:**
```json
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
  "email": "jean.baptiste@email.com",
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
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `firstName` | Required, 2-100 chars |
| `lastName` | Required, 2-100 chars |
| `gender` | Required, must be 'M' or 'F' |
| `dateOfBirth` | Required, valid ISO date |
| `contacts` | Required, at least 1 contact |
| `contacts[].phoneNumber` | Valid phone format |
| `academicYearId` | Must reference existing academic year |
| `classId` | Must belong to specified academic year |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "studentId": 157,
    "admissionNo": "INT-2026-157"
  },
  "message": "Student registered successfully"
}
```

---

### `GET /students/:id`

Get detailed student information including academic records and contacts.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "studentId": 1,
      "admissionNo": "INT-2026-001",
      "firstName": "Eric",
      "lastName": "Mucyo",
      "gender": "M",
      "dateOfBirth": "2005-03-15",
      "nationality": "Rwandan",
      "email": "eric@email.com",
      "phone": "0788123456",
      "status": "active"
    },
    "academicRecords": [
      {
        "yearId": 3,
        "yearLabel": "2025-2026",
        "class": "L3 SOD A",
        "level": "L3",
        "trade": "Software Development",
        "boardingCategory": "Day",
        "sponsorshipType": "Self",
        "gorFunded": false
      }
    ],
    "contacts": [
      {
        "contactId": 1,
        "contactName": "Jean Pierre",
        "relationship": "Father",
        "phoneNumber": "0788223344",
        "isPrimary": true,
        "isGuardian": true
      }
    ]
  }
}
```

---

### `PUT /students/:id`

Update student information. Supports partial updates.

**Request Body (partial):**
```json
{
  "firstName": "Eric",
  "lastName": "Mugisha",
  "email": "eric.mugisha@email.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "firstName": "Eric",
    "lastName": "Mugisha",
    "email": "eric.mugisha@email.com"
  },
  "message": "Student updated successfully"
}
```

---

### `DELETE /students/:id`

Soft-delete a student record.

**Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

### `POST /students/promote`

Promote selected students to the next academic year.

**Request:**
```json
{
  "fromAcademicYearId": 2,
  "toAcademicYearId": 3,
  "studentIds": [1, 2, 3, 4, 5],
  "targetClassIds": {
    "1": 15,
    "2": 15,
    "3": 16,
    "4": 16,
    "5": 17
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "promoted": 5,
    "skipped": 0,
    "alreadyEnrolled": 0
  },
  "message": "5 students promoted successfully"
}
```

---

### `GET /students/export`

Export student data as CSV.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by search term |
| `academicYearId` | int | current | Academic year |
| `format` | string | csv | Export format (csv only) |

**Response (200):** Binary CSV file with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="students_2025-2026.csv"`

---

## 5. Staff Endpoints

### `GET /staff`

List/search staff members.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "staffId": 1,
      "staffNo": "STF-2025-001",
      "fullName": "Mugisha Jean Pierre",
      "position": "School Manager",
      "category": "Teaching",
      "phone": "0788334455",
      "email": "jp.mugisha@iisms.rw",
      "status": "active",
      "photoUrl": "/uploads/staff/photo_1.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 28,
    "totalPages": 2
  }
}
```

---

### `POST /staff`

Create a new staff member.

**Request Body:**
```json
{
  "fullName": "Uwimana Diane",
  "dateOfBirth": "1988-09-22",
  "gender": "F",
  "maritalStatus": "Married",
  "email": "d.uwimana@iisms.rw",
  "phoneNumber": "0788996655",
  "staffCategory": "Teaching",
  "highestQualification": "Master's Degree",
  "domain": "ICT",
  "subDomain": "Software Development",
  "fieldOfStudy": "Computer Science",
  "staffPosition": "Trainer",
  "contractType": "Permanent",
  "province": "Kigali",
  "district": "Kicukiro",
  "sector": "Gahanga",
  "cell": "Karama",
  "village": "Rwezamenyo"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "staffId": 29,
    "staffNo": "STF-2026-029"
  },
  "message": "Staff member registered successfully"
}
```

---

### `POST /staff/:id/photo`

Upload staff photo.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `photo` | file | JPG/PNG/WEBP, max 2MB |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "photoUrl": "/api/v1/files/photos/staff_29.jpg"
  },
  "message": "Photo uploaded successfully"
}
```

---

### `POST /staff/copy-forward`

Copy selected staff members to a new academic year.

**Request:**
```json
{
  "fromAcademicYearId": 2,
  "toAcademicYearId": 3,
  "staffIds": [1, 2, 3, 5, 8, 12]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "copied": 6,
    "alreadyExists": 2,
    "notFound": 0
  },
  "message": "6 staff members copied to 2025-2026"
}
```

---

## 6. Finance Endpoints

### `GET /finance/dashboard`

Get finance KPI cards and overview.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalInvoiced": 45000000,
      "totalCollected": 32500000,
      "outstanding": 12500000,
      "collectionRate": 72.2,
      "totalStudents": 156,
      "studentsWithBalance": 43
    },
    "recentPayments": [
      {
        "paymentId": 1,
        "studentName": "Eric Mucyo",
        "admissionNo": "INT-2026-001",
        "amount": 50000,
        "date": "2026-07-15",
        "method": "Mobile Money"
      }
    ]
  }
}
```

---

### `GET /finance/fee-structure`

Get fee structure matrix for the current academic year.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "feeItems": ["Tuition Fee"],
    "levels": ["L3", "L4", "L5"],
    "rates": {
      "L3": {
        "Term 1": 150000,
        "Term 2": 150000,
        "Term 3": 150000
      },
      "L4": {
        "Term 1": 180000,
        "Term 2": 180000,
        "Term 3": 180000
      },
      "L5": {
        "Term 1": 200000,
        "Term 2": 200000,
        "Term 3": 200000
      }
    }
  }
}
```

---

### `POST /finance/fee-structure`

Upsert a fee rate.

**Request:**
```json
{
  "academicYearId": 3,
  "level": "L3",
  "termId": 7,
  "feeItemId": 1,
  "amount": 160000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Fee rate saved successfully"
}
```

---

### `POST /finance/invoices/generate`

Batch-generate invoices for all students in a term.

**Request:**
```json
{
  "academicYearId": 3,
  "termId": 7,
  "feeItemId": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "generated": 145,
    "skipped": 11,
    "errors": 0
  },
  "message": "145 invoices generated for Term 2"
}
```

---

### `POST /finance/payments`

Record a payment installment.

**Request:**
```json
{
  "invoiceId": 450,
  "studentId": 1,
  "amount": 75000,
  "paymentDate": "2026-07-18",
  "paymentMethod": "Mobile Money",
  "referenceNo": "MM-20260718-001",
  "comment": "Term 2 installment 1/2"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "paymentId": 1,
    "installmentNo": 1,
    "remainingBalance": 75000,
    "invoiceStatus": "partially_paid"
  },
  "message": "Payment recorded successfully"
}
```

---

### `GET /finance/reports`

Get aggregated financial reports.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | Report type: `collection_by_term`, `collection_by_level`, `top_outstanding`, `sponsorship` |
| `academicYearId` | int | Academic year |

---

### `GET /finance/student-statement/:studentId`

Get per-student fee statement.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scope` | string | year | `term`, `year`, `cycle` (3-year) |
| `academicYearId` | int | current | Academic year |
| `termId` | int | — | Term (required for `term` scope) |

---

## 7. Tasks Endpoints

### `GET /tasks`

List tasks for current user or all tasks (for managers).

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | — | Filter: pending/in_progress/completed/cancelled |
| `priority` | string | — | Filter: low/normal/high/urgent |
| `assignedTo` | int | current | User ID (managers only) |
| `moduleKey` | string | — | Filter by module |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "taskId": 1,
      "title": "Update student fee records",
      "description": "...",
      "moduleKey": "finance",
      "assignedTo": { "userId": 5, "fullName": "Kamali Eric" },
      "assignedBy": { "userId": 1, "fullName": "Administrator" },
      "dueDate": "2026-07-25",
      "priority": "high",
      "status": "in_progress"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 65,
    "totalPages": 4
  }
}
```

---

### `POST /tasks`

Create a new task.

**Request:**
```json
{
  "title": "Update student fee records",
  "description": "Review and update all L3 student fee records for Term 2",
  "moduleKey": "finance",
  "assignedTo": 5,
  "dueDate": "2026-07-25",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "taskId": 66
  },
  "message": "Task created successfully"
}
```

---

### `PUT /tasks/:id/status`

Quick status update.

**Request:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task status updated to: completed"
}
```

---

## 8. Utilities & Helpers (Frontend)

### API Service Module

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (token refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Formatting Utilities

```javascript
// utils/formatters.js
export const formatCurrency = (amount, currency = 'RWF') => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('en-GB');
  if (format === 'long') return d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (format === 'iso') return d.toISOString().split('T')[0];
  return d.toLocaleDateString('en-GB');
};

export const formatPercentage = (value) => {
  return `${Math.round(value * 10) / 10}%`;
};

export const formatAdmissionNo = (no) => no;
export const formatStaffNo = (no) => no;
```

### Validation Utilities

```javascript
// utils/validators.js
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^[0-9+\-\s()]{7,20}$/.test(phone);
};

export const isValidNationalId = (id) => {
  return /^\d{16}$/.test(id);
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

### Constants

```javascript
// utils/constants.js
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

export const STUDENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'dropped', label: 'Dropped' },
];

export const CONTACT_RELATIONSHIPS = [
  'Father', 'Mother', 'Guardian', 'Sibling', 'Other'
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export const PAYMENT_METHODS = [
  'Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Other'
];

export const RWANDA_PROVINCES = [
  'Kigali', 'Eastern', 'Western', 'Southern', 'Northern'
];

export const STAFF_CATEGORIES = [
  'Teaching', 'Administrative', 'Support'
];

export const CONTRACT_TYPES = [
  'Permanent', 'Fixed-term', 'Probation', 'Volunteer'
];

export const MODULE_CATEGORIES = {
  'Academic Program': { color: '#0d6efd', icon: 'bi-book' },
  'General Administration': { color: '#198754', icon: 'bi-gear' },
  'Social Impact Program': { color: '#dc3545', icon: 'bi-heart' },
  'Resources Mobilisation': { color: '#ffc107', icon: 'bi-handshake' },
  'Tasks': { color: '#6f42c1', icon: 'bi-check2-square' },
};

export const API_PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
};
```
