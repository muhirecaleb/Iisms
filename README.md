# 🎓 IISMS - Integrated Institutional System Management Suite

> A comprehensive, scalable management system for educational institutions built with modern web technologies.

**Branch:** `nodejs-react-migration` | **Status:** Active Development | **Version:** 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Administrator Credentials](#administrator-credentials)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**IISMS** (Integrated Institutional System Management Suite) is an enterprise-grade management system designed for educational institutions. It provides comprehensive modules for academic management, student services, human resources, finance, and more.

### Core Capabilities

- 👥 **User Management** — Multi-role access control (Admin, Staff, Student, etc.)
- 📚 **Academic Management** — Classes, academic years, students, curriculum
- 💰 **Finance Management** — Invoices, payments, financial tracking
- 📖 **Library Management** — Books, inventory, borrowing system
- 👔 **Human Resources** — Staff management, attendance, payroll
- 📊 **Dashboard** — Real-time analytics and insights
- 🔔 **Notifications** — Email/SMS alerts and notifications
- 📋 **Task Management** — Assignment and tracking system
- 🔐 **RBAC** — Role-based access control with granular permissions
- 📜 **Audit Logs** — Complete system activity tracking

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React 18.x with Vite
- **Styling:** CSS/Tailwind
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Package Manager:** pnpm

### Backend

- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi/Zod
- **Logging:** Morgan + Winston

### DevOps

- **Package Management:** pnpm workspace
- **Database Migrations:** Custom SQL scripts
- **Environment Management:** .env configuration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- MySQL 8.0 or higher
- npm/pnpm package manager
- Git

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url> iisms
cd iisms

# 2. Install dependencies
pnpm install

# 3. Setup database
cd backend
pnpm run migrate

# 4. Start backend server
pnpm run dev

# 5. In another terminal, start frontend
cd frontend
pnpm run dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Database:** localhost:3306

---

## 🔑 Administrator Credentials

Once the system is set up, use these credentials to log in:

```
Username: admin
Password: admin123
```

> ⚠️ **Security Note:** Change these credentials immediately after first login in a production environment.

---

## 📁 Project Structure

```
iisms/
├── frontend/                 # React SPA application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components for each module
│   │   ├── services/        # API service clients
│   │   ├── context/         # React Context for state
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication & authorization
│   │   │   ├── students/    # Student management
│   │   │   ├── staff/       # Human resources
│   │   │   ├── classes/     # Class management
│   │   │   ├── finance/     # Financial management
│   │   │   ├── library/     # Library management
│   │   │   ├── tasks/       # Task management
│   │   │   ├── dashboard/   # Analytics & dashboards
│   │   │   └── users/       # User management
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── routes/          # Route definitions
│   ├── database/            # Database migrations & scripts
│   ├── seeds/               # Database seed data
│   ├── server.js            # Entry point
│   └── package.json
│
├── database/                 # Database schema & migrations
│   ├── iisms.sql            # Full schema
│   └── migrations/          # Incremental migrations
│
└── docs/                     # Project documentation
    ├── ARCHITECTURE.md       # System architecture
    ├── SETUP.md              # Setup instructions
    ├── API-REFERENCE.md      # API endpoints
    ├── DATABASE.md           # Database schema
    ├── MODULES.md            # Module specifications
    ├── ROLES-PERMISSIONS.md  # Authorization rules
    ├── FEATURES-DIVISION.md  # Feature breakdown
    └── CONTRIBUTING.md       # Contribution guidelines
```

---

## ✨ Key Features

### 1. **Multi-Tenant RBAC**

- Flexible role-based access control
- Granular permission management
- User groups and hierarchies

### 2. **Academic Management**

- Academic year management
- Class organization
- Student enrollment tracking
- Curriculum management

### 3. **Finance Module**

- Invoice generation
- Payment processing
- Financial reporting
- Budget tracking

### 4. **Library System**

- Book cataloging
- Borrowing/returning
- Inventory management
- Due date tracking

### 5. **HR Management**

- Staff directory
- Attendance tracking
- Leave management
- Performance evaluation

### 6. **Real-time Notifications**

- Email notifications
- SMS alerts (configurable)
- In-app notifications
- Notification preferences

### 7. **Comprehensive Logging**

- Activity audit logs
- System logs
- User action tracking
- Error logging

---

## 📚 Installation & Setup

For detailed setup instructions including database configuration, environment variables, and troubleshooting, see [docs/SETUP.md](docs/SETUP.md).

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend `.env` example:**

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=iisms
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**Frontend `.env` example:**

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=IISMS
```

---

## 📖 API Documentation

Complete API documentation is available at [docs/API-REFERENCE.md](docs/API-REFERENCE.md).

### Sample Endpoints

```
POST   /api/v1/auth/login          - User login
GET    /api/v1/users               - List users
POST   /api/v1/students            - Create student
GET    /api/v1/classes/:id         - Get class details
POST   /api/v1/finance/invoices    - Create invoice
GET    /api/v1/dashboard/stats     - Get dashboard stats
```

---

## 💻 Development

### Running Development Servers

```bash
# Backend development server (with hot reload)
cd backend
pnpm run dev

# Frontend development server (Vite)
cd frontend
pnpm run dev

# Run database migrations
cd backend
pnpm run migrate

# Seed database with demo data
cd backend
pnpm run seed
```

### Database Migrations

```bash
# Run pending migrations
pnpm run migrate

# Seed test data
pnpm run seed:full

# Reset and seed database
pnpm run migrate:reset
```

### Code Standards

- Follow existing code style
- Write descriptive commit messages
- Add tests for new features
- Update documentation for API changes

---

## 🤝 Contributing

We welcome contributions from the community! Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines on:

- Setting up development environment
- Creating feature branches
- Submitting pull requests
- Code review process
- Testing requirements

---

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System architecture and design patterns
- [Setup Guide](docs/SETUP.md) — Installation and configuration
- [API Reference](docs/API-REFERENCE.md) — Complete API endpoints
- [Database Schema](docs/DATABASE.md) — Database structure and relationships
- [Module Specifications](docs/MODULES.md) — Detailed module documentation
- [Roles & Permissions](docs/ROLES-PERMISSIONS.md) — Authorization model
- [Roadmap](docs/ROADMAP.md) — Feature roadmap and plans

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**

- Verify MySQL is running
- Check connection credentials in `.env`
- Ensure database `iisms` exists

**Port Already in Use**

- Backend: Change `PORT` in `.env`
- Frontend: Vite will auto-increment port

**Authentication Failures**

- Check JWT_SECRET is set
- Verify user exists in database
- Check browser cookies are enabled

For more help, see the detailed [Setup Guide](docs/SETUP.md).

---

## 📞 Support

For questions, issues, or suggestions:

1. Check the [documentation](docs/)
2. Review existing issues on GitHub
3. Create a new issue with detailed information
4. Contact the development team

---


## 🎯 Roadmap

Current focus areas:

- ✅ Core CRUD operations for all modules
- 🏗️ Advanced reporting and analytics
- 🏗️ Mobile application
- 🏗️ API rate limiting and caching
- 🏗️ Internationalization (i18n)

See [docs/ROADMAP.md](docs/ROADMAP.md) for detailed roadmap.

---

**Last Updated:** August 31, 2026  
**Version:** 1.0.0  
**Status:** Active Development

---

## 🙏 Acknowledgments

Built with ❤️ for the educational community.
