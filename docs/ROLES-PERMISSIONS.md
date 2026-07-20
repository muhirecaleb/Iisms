# 🛡️ IISMS Roles & Permissions — Node.js + React

> **Branch:** `nodejs-react-migration`
> **System:** Role-Based Access Control with granular CRUD permissions

---

## 1. RBAC Architecture

### 1.1 Database Schema

```
┌─────────────┐       ┌───────────────────┐       ┌─────────────┐
│    roles    │──────→│ role_permissions   │←──────│   modules   │
└─────────────┘       └───────────────────┘       └─────────────┘
       │                      │                           │
       │                      │                           │
       ▼                      ▼                           ▼
┌─────────────┐       ┌─────────────┐
│    users    │       │  permissions per role:            │
└─────────────┘       │  module_key + can_view            │
                      │  + can_create + can_edit          │
                      │  + can_delete                     │
                      └───────────────────┘
```

### 1.2 Permission Level

Unlike the PHP prototype's binary (view/no-view) permissions, the new system supports granular CRUD permissions per module:

| Permission | Description | Applied To |
|------------|-------------|------------|
| `can_view` | View/list records and details | All endpoints |
| `can_create` | Create new records | POST endpoints |
| `can_edit` | Update existing records | PUT endpoints |
| `can_delete` | Remove records | DELETE endpoints |

### 1.3 JWT Permission Payload

On login, all permissions are loaded into the JWT token for fast authorization without DB lookups:

```json
{
  "sub": 1,
  "username": "admin",
  "role": "Administrator",
  "permissions": {
    "students": { "canView": true, "canCreate": true, "canEdit": true, "canDelete": true },
    "staff": { "canView": true, "canCreate": true, "canEdit": true, "canDelete": true },
    "finance": { "canView": true, "canCreate": true, "canEdit": true, "canDelete": true },
    "tasks": { "canView": true, "canCreate": true, "canEdit": true, "canDelete": true }
  },
  "iat": 1623456789,
  "exp": 1623457689
}
```

---

## 2. Role Definitions

### 2.1 Role Matrix

| # | Role | Scope | Description |
|---|------|-------|-------------|
| 1 | **Administrator** | Full | Complete system access — all modules, all CRUD, system settings, user management |
| 2 | **Director** | Full | Same as Admin but leadership-focused KPIs, strategic reports |
| 3 | **DOS** | Academic | Academic program management, student oversight, timetabling |
| 4 | **Registrar** | Students | Student registration, records, promotions, exports |
| 5 | **Teacher** | Limited | Basic student view, mark entry, personal tasks |
| 6 | **Discipline Officer** | Welfare | Student welfare, disciplinary records, counselling |
| 7 | **Accountant** | Finance | Full finance: fee structure, invoices, sponsorships, payments, reports |
| 8 | **Cashier** | Finance | Payment recording only (search students, receive payments, view invoices) |
| 9 | **Finance Manager** | Finance | Read-only: finance reports and dashboard only (HQ oversight) |
| 10 | **HR Officer** | Staff | Full staff management: registration, editing, copy-forward |
| 11 | **Librarian** | Library | Book catalog, borrow/return management |

### 2.2 Permission Matrix

| Module Key | Admin | Director | DOS | Registrar | Teacher | Discipline | Accountant | Cashier | Finance Mgr | HR Officer | Librarian |
|------------|:-----:|:--------:|:---:|:---------:|:-------:|:----------:|:----------:|:-------:|:-----------:|:----------:|:---------:|
| `dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `students` | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `staff` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `finance` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | 💳 | 👁️ | ❌ | ❌ |
| `tasks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `academic` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `learning` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `library` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `inventory` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `documents` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `qa` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `welfare` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `tracer` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `volunteers` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `partnerships` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `projects` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `system-settings` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `user-management` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Full CRUD access
- 👁️ = View-only access
- 💳 = Payment recording only (can view invoices, record payments)
- ❌ = No access

---

## 3. Permission Verification (Backend Middleware)

### 3.1 Basic Module Check

```javascript
// middleware/rbac.js
const rbacMiddleware = (moduleKey, operations = ['canView']) => {
  return (req, res, next) => {
    const permissions = req.user.permissions || {};
    const modulePerms = permissions[moduleKey];

    if (!modulePerms) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied: ${moduleKey} module not available`,
          details: { userRole: req.user.role }
        }
      });
    }

    // Check each required operation
    for (const op of operations) {
      if (!modulePerms[op]) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied: ${op} not permitted on ${moduleKey}`,
            details: { userRole: req.user.role, requiredOperation: op }
          }
        });
      }
    }

    next();
  };
};
```

### 3.2 Usage in Routes

```javascript
// Route definitions with granular permission checks
router.get('/', rbacMiddleware('students', ['canView']), controller.list);
router.get('/:id', rbacMiddleware('students', ['canView']), controller.getById);
router.post('/', rbacMiddleware('students', ['canCreate']), controller.create);
router.put('/:id', rbacMiddleware('students', ['canEdit']), controller.update);
router.delete('/:id', rbacMiddleware('students', ['canDelete']), controller.delete);
```

### 3.3 Role-Specific Business Logic

```javascript
// Finance controller — role-based behavior
exports.receivePayment = async (req, res, next) => {
  try {
    const { role } = req.user;

    // Cashier: can only record payments, not manage sponsorships
    if (role === 'Cashier') {
      // Allow only payment recording
      const result = await paymentService.recordPayment(req.body, req.user.id);
      return res.status(201).json({ success: true, data: result });
    }

    // Accountant: can also void invoices, adjust amounts
    const { action } = req.body;
    if (action === 'void') {
      const result = await invoiceService.voidInvoice(req.body.invoiceId);
      return res.json({ success: true, data: result });
    }

    const result = await paymentService.recordPayment(req.body, req.user.id);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

---

## 4. Frontend Permission Helpers

### 4.1 useAuth Hook

```javascript
// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Usage: const { user, permissions, hasPermission } = useAuth();
```

### 4.2 Permission Check Helpers

```javascript
// utils/permissions.js
export const canAccessModule = (permissions, moduleKey) => {
  return permissions?.[moduleKey]?.canView || false;
};

export const canCreateModule = (permissions, moduleKey) => {
  return permissions?.[moduleKey]?.canCreate || false;
};

export const canEditModule = (permissions, moduleKey) => {
  return permissions?.[moduleKey]?.canEdit || false;
};

export const canDeleteModule = (permissions, moduleKey) => {
  return permissions?.[moduleKey]?.canDelete || false;
};

// Finance-specific helpers
export const canRecordPayment = (permissions) => {
  return canAccessModule(permissions, 'finance');
};

export const canManageFeeStructure = (permissions, role) => {
  return role === 'Accountant' || role === 'Administrator' || role === 'Director';
};

export const canManageSponsorships = (permissions, role) => {
  return role === 'Accountant' || role === 'Administrator' || role === 'Director';
};

export const canVoidInvoice = (permissions, role) => {
  return role === 'Accountant' || role === 'Administrator';
};

// Task-specific helpers
export const canAssignTasks = (role) => {
  return ['Administrator', 'Director'].includes(role);
};

export const canDeleteTasks = (role) => {
  return ['Administrator', 'Director'].includes(role);
};

export const canViewAllTasks = (role) => {
  return ['Administrator', 'Director'].includes(role);
};
```

### 4.3 ProtectedRoute Component

```jsx
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canAccessModule } from '../utils/permissions';

export const ProtectedRoute = ({ children, module, fallback }) => {
  const { user, permissions, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner overlay />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (module && !canAccessModule(permissions, module)) {
    if (fallback) return fallback;
    return <Navigate to="/403" replace />;
  }

  return children;
};
```

### 4.4 Conditional UI Rendering

```jsx
// Example: Finance Invoice Page
function InvoiceActions({ invoice, onVoid, onDelete }) {
  const { permissions, user } = useAuth();
  const isAccountant = user.role === 'Accountant' || user.role === 'Administrator';

  return (
    <div className="invoice-actions">
      <button onClick={() => onVoid(invoice.id)} disabled={invoice.status === 'paid'}>
        {invoice.status === 'paid' ? 'Paid ✓' : 'Mark as Void'}
      </button>

      {canDeleteModule(permissions, 'finance') && (
        <button className="btn-danger" onClick={() => onDelete(invoice.id)}>
          Delete
        </button>
      )}

      {canCreateModule(permissions, 'finance') && invoice.status === 'open' && (
        <button className="btn-primary" onClick={() => onRecordPayment(invoice.id)}>
          Record Payment
        </button>
      )}
    </div>
  );
}
```

### 4.5 Sidebar Filtering

```jsx
// components/layout/Sidebar.jsx
function Sidebar() {
  const { permissions } = useAuth();

  const menuItems = MODULES.filter(module =>
    canAccessModule(permissions, module.key)
  );

  return (
    <nav className="sidebar">
      {menuItems.map(module => (
        <NavLink key={module.key} to={`/${module.key}`}>
          <i className={module.icon} />
          <span>{module.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## 5. Admin Role Management

### 5.1 Role CRUD Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/system/roles` | List all roles |
| POST | `/api/v1/system/roles` | Create a new role |
| PUT | `/api/v1/system/roles/:id` | Update role details |
| DELETE | `/api/v1/system/roles/:id` | Delete a role (non-system only) |
| GET | `/api/v1/system/roles/:id/permissions` | Get role permissions |
| PUT | `/api/v1/system/roles/:id/permissions` | Update role permissions (bulk) |

### 5.2 User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/system/users` | List all users |
| POST | `/api/v1/system/users` | Create a new user |
| PUT | `/api/v1/system/users/:id` | Update user role/status |
| PUT | `/api/v1/system/users/:id/reset-password` | Reset user password |
| PUT | `/api/v1/system/users/:id/unlock` | Unlock a locked account |

### 5.3 Permission Update Request

```json
PUT /api/v1/system/roles/5/permissions
{
  "permissions": {
    "students": { "canView": true, "canCreate": false, "canEdit": false, "canDelete": false },
    "tasks": { "canView": true, "canCreate": true, "canEdit": true, "canDelete": false },
    "academic": { "canView": true, "canCreate": false, "canEdit": false, "canDelete": false }
  }
}
```

---

## 6. Security Rules & Business Logic

### 6.1 Finance Role Enforcement

| Operation | Accountant | Cashier | Finance Manager |
|-----------|:----------:|:-------:|:---------------:|
| View finance dashboard | ✅ | ✅ | ✅ |
| View fee structure | ✅ | ❌ | ✅ |
| Edit fee structure | ✅ | ❌ | ❌ |
| View all invoices | ✅ | 👁️ (search only) | ✅ |
| Generate batch invoices | ✅ | ❌ | ❌ |
| Void invoices | ✅ | ❌ | ❌ |
| Record payments | ✅ | ✅ | ❌ |
| Edit/void payments | ✅ | ❌ | ❌ |
| Manage sponsorships | ✅ | ❌ | ❌ |
| View financial reports | ✅ | ❌ | ✅ |
| Export reports | ✅ | ❌ | ✅ |

### 6.2 Task Visibility Rules

| Role | Can See | Can Create | Can Edit All | Can Delete |
|------|---------|:----------:|:------------:|:----------:|
| Administrator | All tasks | ✅ | ✅ | ✅ |
| Director | All tasks | ✅ | ✅ | ✅ |
| All other roles | Own tasks only | ✅ | ❌ (own status only) | ❌ |

### 6.3 Self-Management Rules

- All users can view and edit their own profile (name, email, phone)
- All users can change their own password (requires current password)
- Users cannot change their own role
- Users cannot delete their own account

### 6.4 Account Lockout Rules

- **Lock condition:** 5 consecutive failed password attempts within 15 minutes
- **Lock duration:** 30 minutes (automatic unlock) or manual unlock by Admin
- **OTP max attempts:** 5 per code (new code required)
- **OTP expiry:** 10 minutes from generation
