# 🗄️ IISMS Database Schema — MySQL 8.0

> **Branch:** `nodejs-react-migration`
> **Engine:** MySQL 8.0+ / InnoDB
> **Charset:** `utf8mb4` / Collation: `utf8mb4_unicode_ci`

---

## 1. Database Design Philosophy

The new MySQL schema is redesigned from the PHP prototype with these improvements:

| Improvement | PHP Prototype | Node.js + React (New) |
|-------------|---------------|----------------------|
| **Foreign Keys** | Implicit only | Explicit with CASCADE/NO ACTION |
| **Timestamps** | `DATETIME` | `TIMESTAMP` with auto-update |
| **Audit Trail** | Login-only | Full CRUD audit via `audit_log` table |
| **Soft Deletes** | None | `deleted_at` nullable TIMESTAMP |
| **UUID support** | None | Optional UUID PK for public IDs |
| **Indexes** | Minimal | Comprehensive covering indexes |
| **Enum types** | ENUM columns | ENUM + CHECK constraints |
| **JSON fields** | No JSON | JSON columns for flexible metadata |
| **File storage** | Local filesystem | `file_uploads` table + path references |

---

## 2. Complete Schema

### 2.1 Core System Tables

#### `users` — System Users

```sql
CREATE TABLE users (
  user_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL,
  phone         VARCHAR(20) DEFAULT NULL,
  role_id       INT UNSIGNED NOT NULL,
  status        ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_users_role (role_id),
  INDEX idx_users_status (status),
  INDEX idx_users_email (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `roles` — User Roles

```sql
CREATE TABLE roles (
  role_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name   VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,  -- Cannot be deleted
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed Roles:**
| role_id | role_name | Description |
|---------|-----------|-------------|
| 1 | Administrator | Full system access |
| 2 | Director | Leadership access + KPIs |
| 3 | DOS | Academic program management |
| 4 | Registrar | Student registration |
| 5 | Teacher | Basic access, tasks, marks |
| 6 | Discipline Officer | Student welfare |
| 7 | Accountant | Full finance management |
| 8 | Cashier | Payment recording only |
| 9 | Finance Manager | Read-only finance reports |
| 10 | HR Officer | Staff management |
| 11 | Librarian | Library management |

#### `modules` — System Modules

```sql
CREATE TABLE modules (
  module_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module_key  VARCHAR(50) NOT NULL UNIQUE,
  label       VARCHAR(100) NOT NULL,
  icon        VARCHAR(50) NOT NULL DEFAULT 'bi-box',
  built       BOOLEAN NOT NULL DEFAULT FALSE,
  category    VARCHAR(50) NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `role_permissions` — Role ↔ Module (Many-to-Many)

```sql
CREATE TABLE role_permissions (
  permission_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       INT UNSIGNED NOT NULL,
  module_key    VARCHAR(50) NOT NULL,
  can_view      BOOLEAN NOT NULL DEFAULT TRUE,
  can_create    BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit      BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete    BOOLEAN NOT NULL DEFAULT FALSE,
  
  UNIQUE KEY uq_role_module (role_id, module_key),
  INDEX idx_rp_module (module_key),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_module FOREIGN KEY (module_key) REFERENCES modules(module_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Improvement from PHP:** Granular CRUD permissions instead of binary `hasPermission()`.

#### `login_logs` — Authentication Audit Trail

```sql
CREATE TABLE login_logs (
  log_id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED DEFAULT NULL,
  username_attempted  VARCHAR(50) NOT NULL,
  ip_address          VARCHAR(45) NOT NULL,
  user_agent          TEXT DEFAULT NULL,
  status              ENUM('success', 'failed_password', 'failed_otp', 'locked') NOT NULL,
  failure_reason      VARCHAR(255) DEFAULT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_ll_user (user_id),
  INDEX idx_ll_created (created_at),
  INDEX idx_ll_ip (ip_address),
  CONSTRAINT fk_ll_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `otp_codes` — One-Time Passwords

```sql
CREATE TABLE otp_codes (
  otp_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  code_hash    CHAR(64) NOT NULL,  -- SHA-256
  channel      ENUM('email', 'sms') NOT NULL DEFAULT 'email',
  attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 5,
  expires_at   TIMESTAMP NOT NULL,
  consumed_at  TIMESTAMP NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_otp_user (user_id),
  INDEX idx_otp_expires (expires_at),
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `audit_log` — Activity Audit Trail (New!)

```sql
CREATE TABLE audit_log (
  audit_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED DEFAULT NULL,
  action        ENUM('create', 'update', 'delete', 'view', 'export', 'login', 'logout') NOT NULL,
  entity_type   VARCHAR(50) NOT NULL,  -- e.g., 'student', 'invoice', 'staff'
  entity_id     INT UNSIGNED DEFAULT NULL,
  description   VARCHAR(500) DEFAULT NULL,
  changes_json  JSON DEFAULT NULL,     -- Old/new values for updates
  ip_address    VARCHAR(45) DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `refresh_tokens` — JWT Refresh Tokens (New!)

```sql
CREATE TABLE refresh_tokens (
  token_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  CHAR(64) NOT NULL,  -- SHA-256 of refresh token
  expires_at  TIMESTAMP NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_rt_user (user_id),
  INDEX idx_rt_token (token_hash),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `file_uploads` — File Storage (New!)

```sql
CREATE TABLE file_uploads (
  file_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  storage_path  VARCHAR(500) NOT NULL,
  mime_type     VARCHAR(100) NOT NULL,
  file_size     INT UNSIGNED NOT NULL,  -- In bytes
  entity_type   VARCHAR(50) DEFAULT NULL,  -- e.g., 'staff_photo', 'student_photo'
  entity_id     INT UNSIGNED DEFAULT NULL,
  uploaded_by   INT UNSIGNED DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_fu_entity (entity_type, entity_id),
  CONSTRAINT fk_fu_user FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2.2 Academic Year Tables

#### `academic_years` — School Years

```sql
CREATE TABLE academic_years (
  year_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  year_label  VARCHAR(20) NOT NULL UNIQUE,  -- e.g., "2025-2026"
  start_date  DATE DEFAULT NULL,
  end_date    DATE DEFAULT NULL,
  is_current  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_current_year (is_current)  -- Only one current year
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> **Note:** MySQL doesn't enforce a partial unique index on `is_current = 1` natively. Use a trigger or application-level enforcement: "Before setting a year as current, unset all others."

#### `terms` — Academic Terms

```sql
CREATE TABLE terms (
  term_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  academic_year_id INT UNSIGNED NOT NULL,
  term_name       VARCHAR(50) NOT NULL,  -- e.g., "Term 1", "Term 2", "Term 3"
  start_date      DATE DEFAULT NULL,
  end_date        DATE DEFAULT NULL,
  is_current      BOOLEAN NOT NULL DEFAULT FALSE,
  
  INDEX idx_terms_year (academic_year_id),
  CONSTRAINT fk_terms_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `classes` — Student Classes

```sql
CREATE TABLE classes (
  class_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  academic_year_id  INT UNSIGNED NOT NULL,
  class_name       VARCHAR(100) NOT NULL,  -- e.g., "L3 SOD A"
  level            VARCHAR(20) NOT NULL,   -- e.g., "L3", "L4", "L5"
  trade            VARCHAR(100) NOT NULL,  -- e.g., "Software Development"
  capacity         INT UNSIGNED DEFAULT NULL,
  
  INDEX idx_classes_year (academic_year_id),
  INDEX idx_classes_level (level),
  INDEX idx_classes_trade (trade),
  CONSTRAINT fk_classes_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2.3 Student Information System Tables

#### `students` — Student Records

```sql
CREATE TABLE students (
  student_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admission_no         VARCHAR(50) NOT NULL UNIQUE,  -- INT-YYYY-NNN
  national_student_code VARCHAR(50) DEFAULT NULL UNIQUE,
  first_name           VARCHAR(100) NOT NULL,
  last_name            VARCHAR(100) NOT NULL,
  gender               ENUM('M', 'F') NOT NULL,
  date_of_birth        DATE NOT NULL,
  nationality          VARCHAR(50) NOT NULL DEFAULT 'Rwandan',
  residence_status     ENUM('Resident', 'Refugee', 'Non-resident') NOT NULL DEFAULT 'Resident',
  disability           VARCHAR(50) DEFAULT 'None',
  parenthood           VARCHAR(50) DEFAULT NULL,
  father_name          VARCHAR(100) DEFAULT NULL,
  mother_name          VARCHAR(100) DEFAULT NULL,
  email                VARCHAR(100) DEFAULT NULL,
  phone                VARCHAR(20) DEFAULT NULL,
  official_paper_type  VARCHAR(50) DEFAULT NULL,
  official_paper_no    VARCHAR(50) DEFAULT NULL,
  province             VARCHAR(100) DEFAULT NULL,
  district             VARCHAR(100) DEFAULT NULL,
  sector               VARCHAR(100) DEFAULT NULL,
  cell                 VARCHAR(100) DEFAULT NULL,
  village              VARCHAR(100) DEFAULT NULL,
  detail_address       TEXT DEFAULT NULL,
  status               ENUM('active', 'transferred', 'graduated', 'dropped') NOT NULL DEFAULT 'active',
  photo_file_id        INT UNSIGNED DEFAULT NULL,
  metadata_json        JSON DEFAULT NULL,  -- Flexible additional fields
  created_by           INT UNSIGNED DEFAULT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at           TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_students_name (first_name, last_name),
  INDEX idx_students_gender (gender),
  INDEX idx_students_status (status),
  INDEX idx_students_district (district),
  CONSTRAINT fk_students_photo FOREIGN KEY (photo_file_id) REFERENCES file_uploads(file_id) ON DELETE SET NULL,
  CONSTRAINT fk_students_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `student_academic_records` — Multi-Year Enrollment

```sql
CREATE TABLE student_academic_records (
  record_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id        INT UNSIGNED NOT NULL,
  academic_year_id  INT UNSIGNED NOT NULL,
  class_id          INT UNSIGNED NOT NULL,
  term_id           INT UNSIGNED DEFAULT NULL,
  boarding_category ENUM('Day', 'Boarding') NOT NULL DEFAULT 'Day',
  sponsorship_type  VARCHAR(50) DEFAULT NULL,
  gor_funded        BOOLEAN NOT NULL DEFAULT FALSE,
  comment           TEXT DEFAULT NULL,
  
  UNIQUE KEY uq_student_year (student_id, academic_year_id),
  INDEX idx_sar_class (class_id),
  INDEX idx_sar_year (academic_year_id),
  CONSTRAINT fk_sar_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_sar_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE,
  CONSTRAINT fk_sar_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
  CONSTRAINT fk_sar_term FOREIGN KEY (term_id) REFERENCES terms(term_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `student_contacts` — Emergency Contacts

```sql
CREATE TABLE student_contacts (
  contact_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED NOT NULL,
  relationship  VARCHAR(50) NOT NULL,  -- Father, Mother, Guardian, Sibling, Other
  contact_name  VARCHAR(100) NOT NULL,
  id_number     VARCHAR(50) DEFAULT NULL,
  phone_number  VARCHAR(20) NOT NULL,
  email         VARCHAR(100) DEFAULT NULL,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  is_guardian   BOOLEAN NOT NULL DEFAULT FALSE,
  
  INDEX idx_sc_student (student_id),
  CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2.4 Staff/HR Tables

#### `staff` — Staff Records

```sql
CREATE TABLE staff (
  staff_id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  staff_no                  VARCHAR(50) NOT NULL UNIQUE,  -- STF-YYYY-NNN
  full_name                 VARCHAR(100) NOT NULL,
  date_of_birth             DATE DEFAULT NULL,
  gender                    ENUM('M', 'F') NOT NULL,
  marital_status            VARCHAR(20) DEFAULT NULL,
  nationality               VARCHAR(50) DEFAULT 'Rwandan',
  id_passport_no            VARCHAR(50) DEFAULT NULL,
  staff_category            VARCHAR(50) DEFAULT NULL,  -- Teaching, Administrative, Support
  phone_number              VARCHAR(20) DEFAULT NULL,
  email                     VARCHAR(100) DEFAULT NULL,
  highest_qualification     VARCHAR(50) DEFAULT NULL,
  considered_qualification  VARCHAR(50) DEFAULT NULL,
  domain                    VARCHAR(100) DEFAULT NULL,
  sub_domain                VARCHAR(100) DEFAULT NULL,
  field_of_study            VARCHAR(100) DEFAULT NULL,
  graduation_date           DATE DEFAULT NULL,
  staff_position            VARCHAR(100) DEFAULT NULL,
  employment_date_education DATE DEFAULT NULL,
  employment_date_school    DATE DEFAULT NULL,
  contract_type             VARCHAR(50) DEFAULT NULL,
  staff_bank                VARCHAR(50) DEFAULT NULL,
  account_number            VARCHAR(50) DEFAULT NULL,
  staff_rssb_number         VARCHAR(50) DEFAULT NULL,
  province                  VARCHAR(100) DEFAULT NULL,
  district                  VARCHAR(100) DEFAULT NULL,
  sector                    VARCHAR(100) DEFAULT NULL,
  cell                      VARCHAR(100) DEFAULT NULL,
  village                   VARCHAR(100) DEFAULT NULL,
  detail_address            TEXT DEFAULT NULL,
  status                    ENUM('active', 'on_leave', 'resigned', 'terminated') NOT NULL DEFAULT 'active',
  photo_file_id             INT UNSIGNED DEFAULT NULL,
  metadata_json             JSON DEFAULT NULL,
  created_by                INT UNSIGNED DEFAULT NULL,
  created_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at                TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_staff_name (full_name),
  INDEX idx_staff_position (staff_position),
  INDEX idx_staff_status (status),
  CONSTRAINT fk_staff_photo FOREIGN KEY (photo_file_id) REFERENCES file_uploads(file_id) ON DELETE SET NULL,
  CONSTRAINT fk_staff_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `staff_academic_years` — Staff Year Enrollment

```sql
CREATE TABLE staff_academic_years (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  staff_id          INT UNSIGNED NOT NULL,
  academic_year_id  INT UNSIGNED NOT NULL,
  
  UNIQUE KEY uq_staff_year (staff_id, academic_year_id),
  INDEX idx_say_year (academic_year_id),
  CONSTRAINT fk_say_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
  CONSTRAINT fk_say_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2.5 Finance Tables

#### `fee_items` — Fee Product Catalog

```sql
CREATE TABLE fee_items (
  fee_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_name   VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `fee_structures` — Rate Card

```sql
CREATE TABLE fee_structures (
  rate_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  academic_year_id INT UNSIGNED NOT NULL,
  level            VARCHAR(20) NOT NULL,
  term_id          INT UNSIGNED NOT NULL,
  fee_item_id      INT UNSIGNED NOT NULL,
  amount           DECIMAL(12, 2) NOT NULL,
  
  UNIQUE KEY uq_rate (academic_year_id, level, term_id, fee_item_id),
  INDEX idx_fs_year (academic_year_id),
  CONSTRAINT fk_fs_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE,
  CONSTRAINT fk_fs_term FOREIGN KEY (term_id) REFERENCES terms(term_id) ON DELETE CASCADE,
  CONSTRAINT fk_fs_item FOREIGN KEY (fee_item_id) REFERENCES fee_items(fee_item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `invoices` — Student Invoices

```sql
CREATE TABLE invoices (
  invoice_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id       INT UNSIGNED NOT NULL,
  academic_year_id INT UNSIGNED NOT NULL,
  term_id          INT UNSIGNED NOT NULL,
  fee_item_id      INT UNSIGNED NOT NULL,
  invoice_date     DATE NOT NULL,
  gross_amount     DECIMAL(12, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  amount_due       DECIMAL(12, 2) NOT NULL,
  status           ENUM('open', 'partially_paid', 'paid', 'void', 'overdue') NOT NULL DEFAULT 'open',
  notes            TEXT DEFAULT NULL,
  created_by       INT UNSIGNED DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_inv_student (student_id, academic_year_id, term_id),
  INDEX idx_inv_status (status),
  INDEX idx_inv_year (academic_year_id),
  CONSTRAINT fk_inv_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_term FOREIGN KEY (term_id) REFERENCES terms(term_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_item FOREIGN KEY (fee_item_id) REFERENCES fee_items(fee_item_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `payments` — Installment Payments

```sql
CREATE TABLE payments (
  payment_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id      INT UNSIGNED NOT NULL,
  student_id      INT UNSIGNED NOT NULL,
  installment_no  TINYINT UNSIGNED NOT NULL,
  amount          DECIMAL(12, 2) NOT NULL,
  payment_date    DATE NOT NULL,
  payment_method  ENUM('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Other') NOT NULL DEFAULT 'Cash',
  reference_no    VARCHAR(100) DEFAULT NULL,
  received_by     INT UNSIGNED DEFAULT NULL,
  comment         TEXT DEFAULT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_pay_invoice (invoice_id),
  INDEX idx_pay_student (student_id),
  INDEX idx_pay_date (payment_date),
  CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_receiver FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `student_sponsorships` — Fee Sponsorships

```sql
CREATE TABLE student_sponsorships (
  sponsorship_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id       INT UNSIGNED NOT NULL,
  academic_year_id INT UNSIGNED NOT NULL,
  sponsor_name     VARCHAR(200) NOT NULL,
  coverage_percent DECIMAL(5, 2) NOT NULL,
  notes            TEXT DEFAULT NULL,
  created_by       INT UNSIGNED DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uq_sponsor_student_year (student_id, academic_year_id),
  CONSTRAINT fk_sponsor_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_sponsor_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(year_id) ON DELETE CASCADE,
  CONSTRAINT fk_sponsor_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2.6 Tasks Table

#### `tasks` — Task/Action Items

```sql
CREATE TABLE tasks (
  task_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT DEFAULT NULL,
  module_key   VARCHAR(50) DEFAULT NULL,
  assigned_to  INT UNSIGNED DEFAULT NULL,
  assigned_by  INT UNSIGNED DEFAULT NULL,
  due_date     DATE DEFAULT NULL,
  priority     ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  status       ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tasks_assigned (assigned_to),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_module (module_key),
  INDEX idx_tasks_priority (priority),
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assigner FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users    │──────→│   audit_log      │       │ file_uploads     │
│             │       └──────────────────┘       └──────────────────┘
│  role_id ───│──┐                                    ↑         ↑
└─────────────┘  │    ┌─────────────┐                 │         │
                 ├───→│    roles     │                 │         │
                 │    └──────┬───────┘                 │         │
                 │           │                         │         │
                 │    ┌──────▼──────────┐    ┌─────────┴──┐ ┌────┴────────┐
                 │    │ role_permissions │    │   staff    │ │  students   │
                 │    └─────────────────┘    └──────┬──────┘ └──────┬──────┘
                 │                                  │               │
                 │    ┌─────────────┐     ┌─────────▼──────┐ ┌──────▼──────────┐
                 ├───→│   modules   │     │ staff_academic │ │student_academic │
                 │    └─────────────┘     │ _years         │ │_records         │
                 │                        └────────┬───────┘ └──────┬──────────┘
                 │    ┌─────────────┐              │                │
                 └───→│  otp_codes  │              │                │
                      └─────────────┘              │                │
                      ┌─────────────────┐          │                │
                      │ refresh_tokens  │          │                │
                      └─────────────────┘          │                │
                                                   │                │
┌─────────────────┐    ┌──────────────────┐        │                │
│ academic_years  │────│     terms        │        │                │
└────────┬────────┘    └──────────────────┘        │                │
         │                                          │                │
         ├──────────────────────────────────────────┼────────────────┘
         │                      ┌───────────┐       │
         ├──────────────────────│  classes  │       │
         │                      └───────────┘       │
         │                                          │
         ├──────────────────────────────────────────┘
         │                      ┌───────────┐
         └──────────────────────│ fee_items  │
                                └─────┬─────┘
                                      │
                                ┌─────▼──────┐
                                │fee_structures│
                                └─────────────┘

┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ students │───→│ invoices │───→│   payments   │    │  student_    │
│          │    │          │    │              │    │  sponsorships│
└──────────┘    └──────────┘    └──────────────┘    └──────────────┘
                                                           ↑
┌──────────┐    ┌──────────┐                               │
│ students │───→│ student_  │──────────────────────────────┘
│          │    │ contacts  │
└──────────┘    └──────────┘

┌──────────┐    ┌──────────┐
│   users  │───→│   tasks  │
└──────────┘    └──────────┘
```

---

## 4. Migration SQL Files

The database migrations are organized as numbered SQL files in `database/migrations/`:

| File | Description | Destructive? |
|------|-------------|--------------|
| `001_initial_schema.sql` | All CREATE TABLE statements | Drops existing tables |
| `002_seed_data.sql` | Core seed data (roles, modules, permissions, academic years, terms, classes) | Truncates then inserts |
| `003_demo_accounts.sql` | Demo user accounts (username: `admin`, password: `password123`) | Idempotent (INSERT IGNORE) |

### Migration 001: Initial Schema

```sql
-- database/migrations/001_initial_schema.sql
-- IISMS Database Schema v2.0 (Node.js + React)

CREATE DATABASE IF NOT EXISTS iisms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE iisms;

-- Disable foreign key checks for table creation order flexibility
SET FOREIGN_KEY_CHECKS = 0;

-- Include all CREATE TABLE statements from Section 2 above
-- Tables ordered by dependency (parents first)

SET FOREIGN_KEY_CHECKS = 1;
```

### Migration 002: Seed Data

```sql
-- database/migrations/002_seed_data.sql
-- Core seed data for IISMS

-- Roles
INSERT INTO roles (role_name, description, is_system) VALUES
('Administrator', 'Full system access', TRUE),
('Director', 'Leadership dashboard and KPIs', TRUE),
('DOS', 'Academic program management', TRUE),
('Registrar', 'Student registration and records', TRUE),
('Teacher', 'Basic access, tasks, and marks', TRUE),
('Discipline Officer', 'Student welfare and discipline', TRUE),
('Accountant', 'Full financial management', TRUE),
('Cashier', 'Payment recording only', TRUE),
('Finance Manager', 'Read-only financial reports', TRUE),
('HR Officer', 'Staff management', TRUE),
('Librarian', 'Library management', TRUE);

-- Modules
INSERT INTO modules (module_key, label, icon, built, category, sort_order) VALUES
('dashboard', 'Dashboard', 'bi-speedometer2', TRUE, 'System', 0),
('students', 'Student Information System', 'bi-people', TRUE, 'Academic Program', 1),
('academic', 'Academic Management', 'bi-book', FALSE, 'Academic Program', 2),
('learning', 'Learning Management', 'bi-laptop', FALSE, 'Academic Program', 3),
('library', 'Library', 'bi-bookmark', FALSE, 'Academic Program', 4),
('staff', 'Human Resources', 'bi-person-badge', TRUE, 'General Administration', 5),
('finance', 'Finance', 'bi-cash-coin', TRUE, 'General Administration', 6),
('inventory', 'Inventory', 'bi-box', FALSE, 'General Administration', 7),
('documents', 'Document Management', 'bi-file-text', FALSE, 'General Administration', 8),
('qa', 'Quality Assurance', 'bi-check-circle', FALSE, 'General Administration', 9),
('welfare', 'Student Welfare', 'bi-heart', FALSE, 'Social Impact Program', 10),
('tracer', 'Graduate Tracer', 'bi-graph-up', FALSE, 'Social Impact Program', 11),
('volunteers', 'Volunteer Management', 'bi-people', FALSE, 'Social Impact Program', 12),
('partnerships', 'Partnerships', 'bi-handshake', FALSE, 'Resources Mobilisation', 13),
('projects', 'Projects', 'bi-clipboard', FALSE, 'Resources Mobilisation', 14),
('tasks', 'Tasks', 'bi-check2-square', TRUE, 'Tasks', 15);
```

---

## 5. Key Improvements Over PHP Prototype

| Aspect | PHP Prototype | New MySQL Schema |
|--------|---------------|------------------|
| **Foreign Keys** | ❌ Not enforced | ✅ Full referential integrity |
| **Soft Deletes** | ❌ Hard deletes | ✅ `deleted_at` nullable timestamp |
| **Audit Trail** | ❌ Login only | ✅ Full `audit_log` table |
| **File Management** | ❌ Direct file system | ✅ `file_uploads` metadata table |
| **Refresh Tokens** | ❌ Session-based | ✅ `refresh_tokens` table |
| **Granular Permissions** | ❌ Binary view/no-view | ✅ CRUD per module (view/create/edit/delete) |
| **JSON Metadata** | ❌ Not available | ✅ JSON columns for extensibility |
| **Unique Constraints** | ⚠️ Some applied | ✅ Comprehensive unique constraints |
| **created_by/updated_by** | ❌ Not tracked | ✅ Audit columns on major tables |
| **Indexes** | ⚠️ Minimal | ✅ Covering indexes for common queries |
| **Payment Status** | ❌ 4 statuses | ✅ 5 statuses (added `overdue`) |
| **Task Status** | ❌ 3 statuses | ✅ 4 statuses (added `cancelled`) |
| **User Account Lock** | ❌ Not available | ✅ `locked` status + lock tracking |
