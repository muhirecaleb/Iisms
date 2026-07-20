# 🚀 IISMS Setup Guide — Node.js + React + MySQL

> **Branch:** `nodejs-react-migration`
> **Prerequisites:** Node.js 20.x, MySQL 8.0+, npm 10.x

---

## 1. Prerequisites Installation

### 1.1 Install Node.js

**Download:** https://nodejs.org/ (LTS version 20.x)

Verify installation:
```bash
node --version   # v20.x.x
npm --version    # 10.x.x
```

### 1.2 Install MySQL

**Option A: XAMPP (Windows)**
- Download from: https://www.apachefriends.org/
- Start Apache + MySQL modules in XAMPP Control Panel
- MySQL runs on `localhost:3306` with root/empty password

**Option B: Standalone MySQL**
- Download from: https://dev.mysql.com/downloads/mysql/
- Follow installer instructions

**Option C: Docker**
```bash
docker run --name iisms-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=iisms \
  -p 3306:3306 \
  -d mysql:8.0
```

### 1.3 Install Git

**Download:** https://git-scm.com/downloads

Verify:
```bash
git --version
```

---

## 2. Project Setup

### 2.1 Clone the Repository

```bash
git clone <repository-url> iisms
cd iisms
git checkout nodejs-react-migration
```

### 2.2 Database Setup

```bash
# Option A: Via command line
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS iisms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p iisms < database/migrations/001_initial_schema.sql
mysql -u root -p iisms < database/migrations/002_seed_data.sql
mysql -u root -p iisms < database/migrations/003_demo_accounts.sql

# Option B: Via phpMyAdmin
# 1. Open http://localhost/phpmyadmin
# 2. Create database: iisms, charset utf8mb4
# 3. Import SQL files in order: 001 → 002 → 003
```

### 2.3 Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your MySQL credentials
# nano .env or use any text editor

# Install dependencies
npm install

# ⚠️ The following npm scripts (migrate, seed) are planned for Phase 1.
# For now, run the SQL migration files directly via the mysql CLI (see Step 2.2).
# When Phase 1 is complete, these will work:
#   npm run migrate
#   npm run seed

# Start development server
npm run dev
```

**Backend `.env` configuration:**
```env
# Environment
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=iisms
DB_USER=root
DB_PASS=

# JWT Secrets (use strong random values in production)
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
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

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=2097152

# Logging
LOG_LEVEL=debug
```

### 2.4 Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend `.env` configuration:**
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_APP_NAME=IISMS
```

---

## 3. Verify Everything Works

### 3.1 Backend Health Check

```bash
curl http://localhost:3001/api/v1/health
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-07-18T08:30:00.000Z",
    "database": "connected",
    "uptime": 123.45
  }
}
```

### 3.2 Authentication Test

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "fullName": "Administrator",
      "role": "Administrator"
    },
    "requiresOtp": true
  }
}
```

### 3.3 Frontend Verification

1. Open http://localhost:5173 in your browser
2. You should see the IISMS login page
3. Enter username: `admin`, password: `password123`
4. After OTP verification, you should see the dashboard

---

## 4. Development Workflow

### 4.1 Running Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev    # http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev    # http://localhost:5173
```

### 4.2 Available Scripts

#### Backend (`backend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon server.js` | Development with auto-restart |
| `start` | `node server.js` | Production start |
| `test` | `jest --coverage` | Run tests with coverage |
| `test:watch` | `jest --watch` | Test in watch mode |
| `migrate` | `node scripts/migrate.js` | Run database migrations ⚠️ Phase 1 |
| `seed` | `node scripts/seed.js` | Seed demo data ⚠️ Phase 1 |
| `lint` | `eslint src/` | Lint code |
| `lint:fix` | `eslint src/ --fix` | Lint and fix |

#### Frontend (`frontend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Development with HMR |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest run` | Run tests |
| `test:watch` | `vitest` | Test in watch mode |
| `lint` | `eslint src/` | Lint code |
| `lint:fix` | `eslint src/ --fix` | Lint and fix |

### 4.3 Database Migrations

Migration files are in `database/migrations/`:

```
database/migrations/
├── 001_initial_schema.sql   # All CREATE TABLE statements
├── 002_seed_data.sql        # Core seed data (roles, modules, permissions)
└── 003_demo_accounts.sql    # Demo user accounts
```

**To add a new migration:**
1. Create `database/migrations/004_your_change.sql`
2. Update the migration script to include it
3. Run `npm run migrate` to apply

**Migration Rules:**
- Always use `IF NOT EXISTS` for CREATE statements
- Always wrap destructive operations in `SET FOREIGN_KEY_CHECKS = 0/1`
- Each migration should be idempotent (safe to run multiple times)

---

## 5. Docker Setup (Optional)

### docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: iisms-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: iisms
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/migrations:/docker-entrypoint-initdb.d
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  backend:
    build: ./backend
    container_name: iisms-backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: iisms
      DB_USER: root
      DB_PASS: root
      JWT_ACCESS_SECRET: docker-access-secret
      JWT_REFRESH_SECRET: docker-refresh-secret
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - mysql
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    container_name: iisms-frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:3001/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  mysql_data:
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Reset everything
docker-compose down -v
docker-compose up -d
```

---

## 6. Production Deployment

### 6.1 Backend Production

```bash
cd backend

# Set production environment
export NODE_ENV=production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name iisms-api
pm2 save
pm2 startup

# Or use systemd
```

### 6.2 Frontend Production

```bash
cd frontend
npm run build    # Creates dist/ directory

# Serve with Nginx
# server {
#     listen 80;
#     server_name iisms.example.com;
#     root /var/www/iisms/frontend/dist;
#     index index.html;
#     
#     location /api/ {
#         proxy_pass http://localhost:3001;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
```

### 6.3 Security Checklist

- [ ] Change default passwords for all demo accounts
- [ ] Generate strong JWT secrets (use `openssl rand -hex 64`)
- [ ] Set `OTP_DEV_MODE=false` to disable dev OTP preview
- [ ] Enable HTTPS with SSL certificate
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origin (not `*`)
- [ ] Set up database backups
- [ ] Configure rate limiting for auth endpoints
- [ ] Enable helmet security headers
- [ ] Set up monitoring and alerting
- [ ] Configure proper log rotation

---

## 7. Troubleshooting

### Common Issues

| Problem | Symptom | Solution |
|---------|---------|----------|
| **Port already in use** | `EADDRINUSE` error | Kill process: `npx kill-port 3001` or change PORT in `.env` |
| **MySQL connection refused** | `ECONNREFUSED` | Ensure MySQL is running: `mysql -u root -p` to test |
| **MySQL auth error** | `ER_ACCESS_DENIED_ERROR` | Check DB_USER and DB_PASS in `.env` |
| **SQL file too large** | Import fails | Import via command line instead of phpMyAdmin |
| **Frontend CORS error** | Browser console shows CORS | Check CORS_ORIGIN in backend `.env` matches frontend URL |
| **Module not found** | Import errors | Run `npm install` or check file path case |
| **Hooks error** | React error about hooks | Ensure you're calling hooks from functional components only |
| **Token expired** | 401 on API calls | Implement Axios interceptor for token refresh |
| **Migrate fails** | SQL error | Check migration order and dependencies |
