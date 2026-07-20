# 🤝 IISMS Contributing Guide — Node.js + React

> **Branch:** `nodejs-react-migration`
> **Target:** Build a new module from scratch in the new stack

---

## 1. Development Environment Setup

### Prerequisites

```bash
node --version   # >= 20.x
npm --version    # >= 10.x
mysql --version  # >= 8.0
git --version    # Latest
```

### 1.1 Clone & Branch

```bash
git clone <repo-url> iisms
cd iisms
git checkout nodejs-react-migration
```

### 1.2 Database Setup

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS iisms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations in order
mysql -u root -p iisms < database/migrations/001_initial_schema.sql
mysql -u root -p iisms < database/migrations/002_seed_data.sql
mysql -u root -p iisms < database/migrations/003_demo_accounts.sql
```

### 1.3 Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
npm run dev        # Starts on http://localhost:3001
```

### 1.4 Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # Starts on http://localhost:5173
```

### 1.5 Verify Setup

```bash
# Backend health check
curl http://localhost:3001/api/v1/health
# Expected: { "success": true, "data": { "status": "ok", "timestamp": "..." } }

# Frontend
open http://localhost:5173  # Should show login page
```

---

## 2. Step-by-Step: Building a New Module

### Step 1: Design the Database Schema

Create your migration file: `database/migrations/004_your_module.sql`

**Follow these rules:**
- Use `utf8mb4` charset
- Include `created_at`/`updated_at` timestamps
- Include `deleted_at` for soft deletes
- Include `created_by` foreign key to `users` table
- Add appropriate indexes for common queries
- Use `ENGINE=InnoDB` with explicit foreign keys
- Use `ON DELETE CASCADE` for child tables, `ON DELETE SET NULL` for audit columns

**Template:**
```sql
-- database/migrations/004_your_module.sql
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS your_entity (
  entity_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  description   TEXT DEFAULT NULL,
  status        ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  metadata_json JSON DEFAULT NULL,
  created_by    INT UNSIGNED DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL DEFAULT NULL,

  INDEX idx_entity_status (status),
  INDEX idx_entity_created (created_at),
  CONSTRAINT fk_entity_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

### Step 2: Register the Module in the System

Insert a row into the `modules` table and set up permissions for roles:

```sql
INSERT INTO modules (module_key, label, icon, built, category, sort_order)
VALUES ('your_module', 'Your Module Name', 'bi-icon-name', FALSE, 'Appropriate Category', 16);

-- Grant permissions to Administrator role (role_id = 1)
INSERT INTO role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
SELECT 1, 'your_module', TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions WHERE role_id = 1 AND module_key = 'your_module'
);

-- Grant view-only to Director (role_id = 2)
INSERT INTO role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
SELECT 2, 'your_module', TRUE, FALSE, FALSE, FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions WHERE role_id = 2 AND module_key = 'your_module'
);
```

### Step 3: Build the Backend Module

Create the module directory and files:

```bash
mkdir -p backend/src/modules/your-module
```

#### 3a. Create Validation Schemas (`your-module.validation.js`)

```javascript
const Joi = require('joi');

exports.createSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

exports.updateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('active', 'inactive'),
}).min(1);

exports.listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('', null),
  status: Joi.string().valid('active', 'inactive', '').allow(''),
  sortBy: Joi.string().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
```

#### 3b. Create Service Layer (`your-module.service.js`)

```javascript
const db = require('../../config/database');

class YourModuleService {
  async list({ page, limit, search, status, sortBy, sortOrder }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM your_entity WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;

    // Fetch paginated
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [rows] = await db.query(query, params);

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM your_entity WHERE entity_id = ? AND deleted_at IS NULL',
      [id]
    );
    if (rows.length === 0) {
      const { NotFoundError } = require('../../utils/errors');
      throw new NotFoundError('Entity not found');
    }
    return rows[0];
  }

  async create(data, userId) {
    const [result] = await db.query(
      'INSERT INTO your_entity (name, description, status, created_by) VALUES (?, ?, ?, ?)',
      [data.name, data.description, data.status, userId]
    );
    return { entityId: result.insertId, ...data };
  }

  async update(id, data, userId) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.query(
      `UPDATE your_entity SET ${fields.join(', ')} WHERE entity_id = ? AND deleted_at IS NULL`,
      params
    );
    return this.getById(id);
  }

  async delete(id, userId) {
    // Soft delete
    await db.query(
      'UPDATE your_entity SET deleted_at = CURRENT_TIMESTAMP WHERE entity_id = ? AND deleted_at IS NULL',
      [id]
    );
    // Log the deletion
    await db.query(
      'INSERT INTO audit_log (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'delete', 'your_entity', id, `Deleted entity ${id}`]
    );
  }
}

module.exports = new YourModuleService();
```

#### 3c. Create Controller (`your-module.controller.js`)

```javascript
const service = require('./your-module.service');

exports.list = async (req, res, next) => {
  try {
    const result = await service.list(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const entity = await service.getById(req.params.id);
    res.json({ success: true, data: entity });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const entity = await service.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: entity });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const entity = await service.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: entity });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'Entity deleted successfully' });
  } catch (error) {
    next(error);
  }
};
```

#### 3d. Create Routes (`your-module.routes.js`)

```javascript
const router = require('express').Router();
const controller = require('./your-module.controller');
const { authMiddleware, rbacMiddleware, validate } = require('../../middleware');
const { createSchema, updateSchema, listQuery } = require('./your-module.validation');

router.use(authMiddleware);

router.get('/',
  rbacMiddleware('your_module', ['canView']),
  validate(listQuery, 'query'),
  controller.list
);

router.get('/:id',
  rbacMiddleware('your_module', ['canView']),
  controller.getById
);

router.post('/',
  rbacMiddleware('your_module', ['canCreate']),
  validate(createSchema, 'body'),
  controller.create
);

router.put('/:id',
  rbacMiddleware('your_module', ['canEdit']),
  validate(updateSchema, 'body'),
  controller.update
);

router.delete('/:id',
  rbacMiddleware('your_module', ['canDelete']),
  controller.delete
);

module.exports = router;
```

### Step 4: Build the Frontend Module

Create the page components:

```bash
mkdir -p frontend/src/pages/your-module
mkdir -p frontend/src/services
```

#### 4a. Create Service (`frontend/src/services/your-module.service.js`)

```javascript
import api from './api';

export const yourModuleService = {
  list: (params) => api.get('/your-module', { params }),
  getById: (id) => api.get(`/your-module/${id}`),
  create: (data) => api.post('/your-module', data),
  update: (id, data) => api.put(`/your-module/${id}`, data),
  delete: (id) => api.delete(`/your-module/${id}`),
};
```

#### 4b. Create List Page Template (`frontend/src/pages/your-module/YourModuleListPage.jsx`)

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { yourModuleService } from '../../services/your-module.service';
import { useAuth } from '../../hooks/useAuth';
import { canCreateModule } from '../../utils/permissions';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <span className={`badge bg-${value === 'active' ? 'success' : 'secondary'}`}>
        {value}
      </span>
    ),
  },
  { key: 'createdAt', label: 'Created', sortable: true },
];

export default function YourModuleListPage() {
  const { permissions } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState('');

  const canCreate = canCreateModule(permissions, 'your_module');

  useEffect(() => {
    fetchData();
  }, [pagination.page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await yourModuleService.list({ ...pagination, search });
      setData(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await yourModuleService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading && data.length === 0) return <LoadingSpinner overlay />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Module</h1>
        {canCreate && (
          <Link to="/your-module/add" className="btn btn-primary">
            <i className="bi bi-plus-lg" /> Add New
          </Link>
        )}
      </div>

      <div className="search-bar mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {data.length === 0 && !loading ? (
        <EmptyState
          icon="bi-box"
          title="No records found"
          description="Get started by creating your first record."
          action={canCreate && { label: 'Add New', to: '/your-module/add' }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
          onEdit={(id) => `/your-module/${id}/edit`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
```

#### 4c. Add Routes in App.jsx

```jsx
// In App.jsx router configuration
import YourModuleListPage from './pages/your-module/YourModuleListPage';
import YourModuleFormPage from './pages/your-module/YourModuleFormPage';

// Add inside the protected MainLayout routes
{ path: '/your-module', element: <ProtectedRoute module="your_module"><YourModuleListPage /></ProtectedRoute> },
{ path: '/your-module/add', element: <ProtectedRoute module="your_module"><YourModuleFormPage /></ProtectedRoute> },
{ path: '/your-module/:id/edit', element: <ProtectedRoute module="your_module"><YourModuleFormPage /></ProtectedRoute> },
```

### Step 5: Update the Sidebar

The sidebar automatically discovers modules from a central configuration. Create or update `frontend/src/utils/modules.js` with your module's registry entry:

```javascript
// frontend/src/utils/modules.js — Module registry for the sidebar
export const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', category: 'System' },
  { key: 'students', label: 'Students', icon: 'bi-people', category: 'Academic Program' },
  { key: 'staff', label: 'Staff', icon: 'bi-person-badge', category: 'General Administration' },
  { key: 'finance', label: 'Finance', icon: 'bi-cash-coin', category: 'General Administration' },
  { key: 'tasks', label: 'Tasks', icon: 'bi-check2-square', category: 'Tasks' },
  // Add your module here:
  { key: 'your-module', label: 'Your Module', icon: 'bi-box', category: 'Your Category' },
];
```

### Step 6: Wire Up Through the Sidebar

The sidebar component filters this list based on user permissions:

```jsx
// In Sidebar.jsx
const visibleModules = MODULES.filter(m => canAccessModule(permissions, m.key));
```

---

## 3. Code Templates

### 3.1 Database Migration Template

```sql
-- database/migrations/XXX_your_module.sql
-- Description: Creates [module name] tables
-- Dependencies: 001_initial_schema.sql

SET FOREIGN_KEY_CHECKS = 0;

-- Your CREATE TABLE statements here

SET FOREIGN_KEY_CHECKS = 1;
```

### 3.2 Backend Module Template

```javascript
// backend/src/modules/{module}/
// ├── {module}.controller.js   See 3c above
// ├── {module}.service.js      See 3b above
// ├── {module}.routes.js       See 3d above
// └── {module}.validation.js   See 3a above
```

### 3.3 Frontend Services Template

```javascript
// frontend/src/services/{module}.service.js
import api from './api';

export const moduleService = {
  list: (params) => api.get('/{module}', { params }),
  getById: (id) => api.get(`/{module}/${id}`),
  create: (data) => api.post('/{module}', data),
  update: (id, data) => api.put(`/{module}/${id}`, data),
  delete: (id) => api.delete(`/{module}/${id}`),
};
```

### 3.4 Frontend Page Template

```jsx
// frontend/src/pages/{module}/{Module}ListPage.jsx
import { useState, useEffect } from 'react';
import { moduleService } from '../../services/{module}.service';
// ... (see 4b above)
```

---

## 4. Testing Checklist

### Backend Tests

```javascript
// backend/src/modules/your-module/your-module.test.js
const request = require('supertest');
const app = require('../../app');

describe('Your Module API', () => {
  let authToken;

  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'password123' });
    authToken = res.body.data.accessToken;
  });

  describe('GET /api/v1/your-module', () => {
    it('should return paginated list', async () => {
      const res = await request(app)
        .get('/api/v1/your-module')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/your-module');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/your-module', () => {
    it('should create a new entity', async () => {
      const res = await request(app)
        .post('/api/v1/your-module')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Entity' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Entity');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/api/v1/your-module')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' }); // Empty name
      expect(res.status).toBe(400);
    });
  });
});
```

### Frontend Tests

```jsx
// frontend/src/pages/your-module/__tests__/YourModuleListPage.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import YourModuleListPage from '../YourModuleListPage';

// Mock the service
jest.mock('../../../services/your-module.service', () => ({
  list: jest.fn().mockResolvedValue({
    data: { data: [], pagination: { page: 1, limit: 20, total: 0 } }
  })
}));

test('renders page title', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <YourModuleListPage />
      </AuthProvider>
    </BrowserRouter>
  );
  expect(screen.getByText('Your Module')).toBeInTheDocument();
});
```

### Pre-Commit Checklist

- [ ] Database migration runs without errors
- [ ] Module registered in `modules` table
- [ ] Permissions set for appropriate roles
- [ ] Backend: All endpoints return correct status codes
- [ ] Backend: Validation rejects invalid input
- [ ] Backend: Authentication/authorization enforced
- [ ] Frontend: List page shows data with pagination
- [ ] Frontend: Create form validates and submits
- [ ] Frontend: Edit form pre-populates correctly
- [ ] Frontend: Delete works with confirmation
- [ ] Frontend handles loading state
- [ ] Frontend handles empty state
- [ ] Frontend handles error state
- [ ] Module appears in sidebar
- [ ] Module routes are protected by RBAC
- [ ] Audit log entries created for CRUD operations

---

## 5. Common Pitfalls

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Module not in sidebar** | 404 when navigating | Add to `MODULES` constant in `utils/modules.js` |
| **403 Forbidden** | API returns 403 | Check `role_permissions` table for your role/module |
| **401 on API calls** | Token expired | Implement token refresh flow in Axios interceptor |
| **CORS errors** | Browser blocks request | Check `CORS_ORIGIN` in backend `.env` |
| **Foreign key error** | Cannot insert/delete | Check table dependencies and migration order |
| **Empty DataTable** | Page shows empty | Check academic year filter in query |
| **Image upload fails** | 400 Bad Request | Check file type (JPG/PNG/WEBP) and size (max 2MB) |
| **Slow queries** | Pages load slowly | Add database indexes for filtered columns |
| **Wizard data lost** | Form resets | Store wizard state in component state (not session) |
| **Soft delete not filtering** | Deleted items visible | Always add `WHERE deleted_at IS NULL` to queries |

---

## 6. Recommended Libraries

### Backend

| Library | Purpose | Installation |
|---------|---------|-------------|
| **express** | HTTP framework | `npm install express` |
| **mysql2** | MySQL driver (promise) | `npm install mysql2` |
| **jsonwebtoken** | JWT creation/verification | `npm install jsonwebtoken` |
| **bcrypt** | Password hashing | `npm install bcrypt` |
| **joi** | Request validation | `npm install joi` |
| **winston** | Logging | `npm install winston` |
| **nodemailer** | Email sending | `npm install nodemailer` |
| **multer** | File upload handling | `npm install multer` |
| **helmet** | Security headers | `npm install helmet` |
| **cors** | CORS middleware | `npm install cors` |
| **dotenv** | Env variable management | `npm install dotenv` |
| **express-rate-limit** | Rate limiting | `npm install express-rate-limit` |
| **morgan** | HTTP logging | `npm install morgan` |
| **jest + supertest** | Testing | `npm install -D jest supertest` |

### Frontend

| Library | Purpose | Installation |
|---------|---------|-------------|
| **react-router-dom** | Client-side routing | `npm install react-router-dom` |
| **axios** | HTTP client | `npm install axios` |
| **react-hook-form** | Form management | `npm install react-hook-form @hookform/resolvers` |
| **recharts** | Charts & graphs | `npm install recharts` |
| **react-hot-toast** | Toast notifications | `npm install react-hot-toast` |
| **date-fns** | Date utilities | `npm install date-fns` |
| **@testing-library/react** | Component testing | `npm install -D @testing-library/react` |
| **tailwindcss** | Utility-first CSS | `npm install -D tailwindcss postcss autoprefixer` |
