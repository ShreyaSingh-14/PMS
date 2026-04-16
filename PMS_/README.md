<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-v4-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-v8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<h1 align="center">🎯 PMS — Performance Management System</h1>

<p align="center">
  <strong>An enterprise-grade, full-stack Performance Management System that unifies Goal Management, Probation Tracking, Performance Review Cycles, and HR Compliance Automation into a single platform.</strong>
</p>

---

## 📖 Table of Contents

- [Product Overview](#-product-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema (ERD)](#-database-schema-erd)
- [API Reference](#-api-reference)
- [Cron Jobs & Automation Engine](#-cron-jobs--automation-engine)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Frontend Architecture](#-frontend-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Design Decisions](#-design-decisions)
- [Future Roadmap](#-future-roadmap)

---

## 🏢 Product Overview

PMS replaces fragmented email threads, informal spreadsheets, and undocumented performance conversations with a **structured, automated, and auditable** platform. It is designed to serve three distinct user personas:

| Role | Core Responsibility |
|------|-------------------|
| **Employee** | Draft goals, submit self-feedback, view cross-shared review history |
| **Manager** | Approve/reject goals, provide manager feedback, view team aggregations |
| **Admin/HR** | Monitor org-wide compliance, resolve flagged reviews, manage probation, export reports |

### Business Problems Solved

1. **No more informal feedback** — All performance data is structured, timestamped, and cross-shared.
2. **No missed probation milestones** — Automated Day 30/60/80 triggers with escalation ladders.
3. **No siloed goals** — Cascading architecture links Company → Team → Individual goals.
4. **No manual cycle management** — Bi-Annual and Quarterly review cycles fire automatically on schedule.
5. **No hidden performance patterns** — Repeated flags across cycles are detected and surfaced to Admin.

---

## ✨ Key Features

### 🎯 Goal Management System (GMS)
- **Goal CRUD** — Create, update, delete (Draft-only), and archive goals.
- **Goal Lifecycle** — `Draft` → `Pending Approval` → `Active` → `Completed` → `Archived`.
- **Goal Cascading** — Company → Team → Individual via `parentGoalId` linking.
- **Weightage Validation** — Total weightage per user cannot exceed 100%.
- **Subtask Tracking** — Toggle individual subtasks; completion percentage auto-recalculates.
- **Company Goal Updates** — Mid-cycle updates notify all cascaded goal owners; 5-day acknowledgment window.
- **Goal Ownership Transfer** — When employees change teams, goals follow the employee.
- **Goal Approval Escalation** — Goals pending approval for 5+ business days auto-escalate to Admin.
- **Team & Company Aggregations** — Weighted average completion metrics for managers and admins.

### 📋 Performance Review System
- **Probation Reviews** — Auto-triggered at Day 30, 60, and 80 (business days) after joining.
- **Cycle Reviews** — Bi-Annual (Feb/Aug) and Quarterly (Jan/Apr/Jul/Oct) tracks.
- **Self-Feedback** — Employees submit progress notes + rating (`Below` / `Meets` / `Above`).
- **Manager Feedback** — Managers submit comments + rating; review auto-closes.
- **Cross-Sharing** — Employee only sees manager feedback after submitting their own self-feedback.
- **Review Blocking** — Self-rating is blocked if the employee has zero active goals.
- **Discussion Scheduling** — Managers can schedule 1-on-1 discussion dates with email notifications.

### 🚩 Flagging & Escalation Engine
- **Soft Flags** — Blank open-ended responses automatically flagged.
- **Hard Flags** — `Below` rating or negative sentiment keywords trigger flags.
- **Sentiment Detection** — Scans for keywords: "terrible", "unfair", "toxic", "burnout", "abusive", etc.
- **Pattern Detection** — Consecutive flags across different cycles for the same employee are surfaced.
- **7-Day Flag Aging** — Unresolved flags auto-escalate to Admin after 7 days of inaction.
- **Admin Resolution** — Admins can Waive, Extend, or Escalate flagged reviews.

### ⏰ Automation & Cron Engine
- **Probation Cron** — Daily midnight check for Day 30/60/80 milestones.
- **Cycle Cron** — 1st of month cycle triggers + daily 10 AM close/finalize checks.
- **Reminder Cron** — Multi-tier escalation (5th gentle, 15th urgent, 22nd hard escalation).
- **Finalization Cron** — Post-close snapshot of unsubmitted reviews with admin notifications.

### 🛡️ Admin & HR Dashboard
- **Compliance Rate** — Real-time percentage of closed vs. total reviews.
- **Flagged Review Queue** — Live queue with pattern detection alerts.
- **Org-Level GMS Aggregations** — Company/Team/Individual goal breakdowns.
- **Month-over-Month Analytics** — Closed reviews and flag counts grouped by month.
- **Probation Management** — Confirm, Extend, Pause, or reassign managers.
- **CSV Export** — Full compliance and review data export.
- **Cycle Management Dashboard** — View active cycles, close cycles, bulk extend/waive reviews.
- **Audit Trail** — Every admin action on a review is logged with timestamps and reasons.

---

## 🏗 System Architecture

> 📐 See `architecture.drawio` in the project root for the full interactive diagram.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                        │
│  ┌──────────┐ ┌───────────┐ ┌──────────────┐ ┌─────────────────┐   │
│  │ Landing  │ │   Auth    │ │  Dashboard   │ │  Goal/Review    │   │
│  │  Page    │ │   Page    │ │  (Role-based)│ │  Components     │   │
│  └──────────┘ └───────────┘ └──────────────┘ └─────────────────┘   │
│       │              │              │                │              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              AuthContext + ModalContext (State)               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│       │              │              │                │              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         Axios Instance (api.js) — JWT Interceptor            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTP REST (Port 5173 → 5001)
┌──────────────────────────────┴──────────────────────────────────────┐
│                     SERVER (Node.js + Express)                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                           │   │
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────────────────┐     │   │
│  │  │  CORS   │  │ JSON Parser │  │  Auth (JWT + RBAC)   │     │   │
│  │  └─────────┘  └─────────────┘  └──────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Route Layer                              │   │
│  │  /api/auth  │  /api/goals  │  /api/reviews  │  /api/admin   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Controller Layer                           │   │
│  │  authCtrl  │  goalCtrl  │  reviewCtrl  │  adminCtrl/cycCtrl │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               Services (Cron Jobs)                           │   │
│  │  probationCron │ cycleCron │ reminderCron │ finalizationCron │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Utilities                                 │   │
│  │                   sendEmail (Nodemailer)                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  Mongoose ODM
┌──────────────────────────────┴──────────────────────────────────────┐
│                     DATABASE (MongoDB Atlas)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Users   │  │  Goals   │  │ Reviews  │  │  Cycles  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Pattern

- **Monolithic MVC** — Express routes → controllers → Mongoose models.
- **Single-Page Application** — React manages all views via state-driven routing (no react-router pages; tab-based navigation within the dashboard shell).
- **Shared Context** — `AuthContext` manages global user state + JWT; `ModalContext` provides system-wide alert/confirm/prompt dialogs.
- **Background Workers** — `node-cron` scheduled tasks run within the same Node.js process for probation triggers, cycle management, reminders, and finalization.

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | Component-based UI framework |
| **Vite 8** | Fast dev server and build tool |
| **Axios** | HTTP client with JWT interceptor |
| **Lucide React** | Modern icon library |
| **React Router DOM 7** | Available but routing is currently state-driven |
| **Vanilla CSS** | Custom design system with CSS variables |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express 4** | REST API framework |
| **Mongoose 8** | MongoDB ODM |
| **bcryptjs** | Password hashing (salt rounds: 10) |
| **jsonwebtoken** | JWT generation (30-day expiry) |
| **node-cron** | Scheduled background tasks |
| **Nodemailer** | SMTP email notifications |
| **Swagger** | API documentation (swagger-jsdoc + swagger-ui-express) |

### Database
| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Cloud-hosted document database |

### Dev Tools
| Technology | Purpose |
|-----------|---------|
| **Nodemon** | Auto-restart server on file changes |
| **ESLint** | Frontend code linting |

---

## 📁 Project Structure

```
PMS_/
├── client/                          # Frontend (React + Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api.js                   # Axios instance + JWT interceptor
│   │   ├── main.jsx                 # React entry point (AuthProvider + ModalProvider)
│   │   ├── App.jsx                  # Main app — Landing, Auth, Dashboard shell
│   │   ├── App.css                  # Component-specific styles
│   │   ├── index.css                # Global design system (CSS variables, utilities)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Global auth state (login, register, logout)
│   │   │   └── ModalContext.jsx     # System-wide alert/confirm/prompt modals
│   │   ├── components/
│   │   │   ├── GoalsGMS.jsx         # Goal Management System UI (CRUD, cascading, subtasks)
│   │   │   ├── FeedbackForms.jsx    # Review feedback forms (self + manager)
│   │   │   ├── AdminCycleDashboard.jsx  # Cycle management dashboard
│   │   │   └── dashboards/
│   │   │       ├── AdminDashboard.jsx     # Admin/HR dashboard (stats, flags, probation)
│   │   │       ├── ManagerDashboard.jsx   # Manager dashboard (team goals, approvals)
│   │   │       └── EmployeeDashboard.jsx  # Employee dashboard (my goals, reviews)
│   │   └── styles/
│   │       └── AdminCycleDashboard.css    # Cycle dashboard styles
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite configuration
│   └── package.json
│
├── server/                          # Backend (Node.js + Express)
│   ├── server.js                    # Entry point — DB connect, middleware, routes, cron init
│   ├── config/
│   │   ├── db.js                    # MongoDB connection (Mongoose)
│   │   └── swagger.js               # Swagger/OpenAPI configuration
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification + role guards (protect, admin, manager)
│   ├── models/
│   │   ├── User.js                  # User schema (roles, probation, review track)
│   │   ├── Goal.js                  # Goal schema (cascading, subtasks, weightage)
│   │   ├── Review.js                # Review schema (feedback, flags, audit log)
│   │   └── Cycle.js                 # Cycle schema (lifecycle, statistics, unsubmitted list)
│   ├── controllers/
│   │   ├── authController.js        # Register + Login (bcrypt + JWT)
│   │   ├── goalController.js        # Goal CRUD, approval, cascading, aggregations
│   │   ├── reviewController.js      # Feedback submission, flagging, reassignment
│   │   ├── adminController.js       # Dashboard stats, probation mgmt, CSV export
│   │   └── adminCycleController.js  # Cycle CRUD, bulk actions, audit trail
│   ├── routes/
│   │   ├── authRoutes.js            # POST /register, /login
│   │   ├── goalRoutes.js            # Goal CRUD + cascading + aggregations
│   │   ├── reviewRoutes.js          # Feedback + scheduling
│   │   ├── adminRoutes.js           # Dashboard + probation + CSV
│   │   └── adminCycleRoutes.js      # Cycle management + bulk actions
│   ├── services/
│   │   ├── probationCron.js         # Day 30/60/80 milestone triggers
│   │   ├── cycleCron.js             # Monthly cycle triggers + daily close/finalize
│   │   ├── reminderCron.js          # Multi-tier escalation reminders
│   │   └── cycleFinalizationCron.js # Post-close finalization + admin notifications
│   ├── utils/
│   │   └── sendEmail.js             # Nodemailer transporter (Ethereal fallback)
│   ├── .env                         # Environment variables
│   └── package.json
│
├── .gitignore
└── FEEDBACK_IMPLEMENTATION_VERIFICATION.md
```

---

## 🗄 Database Schema (ERD)

### User Collection
```
User {
  _id:              ObjectId (PK)
  name:             String (required)
  email:            String (required, unique)
  password:         String (required, bcrypt hashed)
  role:             Enum ['Employee', 'Manager', 'Admin']
  managerId:        ObjectId → User (FK, self-referencing)
  dateOfJoining:    Date (required)
  department:       String
  reviewTrack:      Enum ['Bi-Annual', 'Quarterly']
  probationStatus:  Enum ['Active', 'Paused', 'Confirmed', 'Extended', 'Closed', 'Under Review']
  createdAt:        Date (auto)
  updatedAt:        Date (auto)
}
```

### Goal Collection
```
Goal {
  _id:                  ObjectId (PK)
  title:                String (required)
  description:          String
  ownerId:              ObjectId → User (FK, required)
  type:                 Enum ['Company', 'Team', 'Individual']
  status:               Enum ['Draft', 'Pending Approval', 'Active', 'Completed', 'Archived']
  completionPercentage: Number (0-100)
  weightage:            Number (0-100, must total ≤100 per user)
  cycle:                String (e.g. 'Q1 2024')
  deadline:             Date
  parentGoalId:         ObjectId → Goal (FK, for cascading)
  subtasks:             [{ title: String, isCompleted: Boolean }]
  notes:                [{ content: String, date: Date }]
  blockers:             [{ issue: String, isResolved: Boolean }]
  createdAt:            Date (auto)
  updatedAt:            Date (auto)
}
```

### Review Collection
```
Review {
  _id:                    ObjectId (PK)
  subjectId:              ObjectId → User (FK, required)
  managerId:              ObjectId → User (FK)
  designatedReviewerId:   ObjectId → User (FK)
  cycleId:                ObjectId → Cycle (FK)
  type:                   Enum ['Probation_30', 'Probation_60', 'Probation_80',
                                'Cycle_BiAnnual', 'Cycle_Quarterly']
  status:                 Enum ['Pending', 'Submitted', 'Flagged', 'Closed',
                                'Waived', 'Extended']
  selfFeedback: {
    progress:             String
    rating:               Enum ['Below', 'Meets', 'Above']
    submittedAt:          Date
  }
  managerFeedback: {
    comments:             String
    rating:               Enum ['Below', 'Meets', 'Above']
    submittedAt:          Date
  }
  isFlagged:              Boolean
  flaggedAt:              Date
  hrNote:                 String
  hrResolved:             Boolean
  flagActionTaken:        Boolean
  discussionDate:         Date
  dueDate:                Date
  extensionGrantedUntil:  Date
  waiverReason:           String
  contextNote:            String
  sharedGoalsContext:     [ObjectId → Goal]
  auditLog: [{
    action:               String ('reassigned', 'extended', 'waived', 'escalated')
    performedBy:          ObjectId → User
    reason:               String
    timestamp:            Date
    previousValue:        Mixed
    newValue:             Mixed
  }]
  createdAt:              Date (auto)
  updatedAt:              Date (auto)
}
```

### Cycle Collection
```
Cycle {
  _id:               ObjectId (PK)
  type:              Enum ['Bi-Annual', 'Quarterly']
  month:             Number (1-12)
  year:              Number
  triggerDate:       Date (when cycle opens)
  closeDate:         Date (when submissions close)
  finalizeDate:      Date (when finalization begins)
  status:            Enum ['Open', 'Closed', 'Finalized', 'Archived']
  totalEligible:     Number
  totalSubmitted:    Number
  totalFlagged:      Number
  totalWaived:       Number
  totalExtended:     Number
  notes:             String
  finalizedAt:       Date
  finalizedBy:       ObjectId → User
  finalizeNotes:     String
  unsubmittedReviews: [{
    reviewId:        ObjectId → Review
    employeeName:    String
    employeeId:      ObjectId → User
    reviewType:      String
    dueDate:         Date
    action:          Enum ['Pending', 'Extended', 'Waived', 'Escalated']
    actionReason:    String
  }]
  createdAt:         Date (auto)
  updatedAt:         Date (auto)
}
```

### Entity Relationships
```
User (1) ──── managerId ────→ User (1)          [Self-reference: Employee → Manager]
User (1) ←──── ownerId ────── Goal (N)          [One user owns many goals]
Goal (1) ←── parentGoalId ──── Goal (N)          [Cascading: Company → Team → Individual]
User (1) ←── subjectId ─────── Review (N)        [One user is subject of many reviews]
User (1) ←── managerId ─────── Review (N)        [One manager reviews many employees]
Cycle (1) ←── cycleId ────────  Review (N)        [One cycle contains many reviews]
```

---

## 📡 API Reference

> Interactive API docs available at `http://localhost:5001/api-docs` (Swagger UI)

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register new user (name, email, password, role, dateOfJoining) |
| `POST` | `/login` | ❌ | Login and receive JWT token (30-day expiry) |

### Goals (`/api/goals`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/` | ✅ | Any | Create a new goal (Draft for Individual, Active for Company/Team) |
| `GET` | `/my-goals` | ✅ | Any | Get current user's goals |
| `GET` | `/team-goals` | ✅ | Manager+ | Get all team members' goals |
| `PATCH` | `/:id` | ✅ | Owner/Manager | Update goal (completion, status, title, description, deadline) |
| `DELETE` | `/:id` | ✅ | Owner | Delete a goal (Draft status only) |
| `PATCH` | `/:goalId/subtasks/:subtaskId/toggle` | ✅ | Any | Toggle subtask completion → auto-recalculate percentage |
| `PATCH` | `/:id/approve` | ✅ | Manager+ | Approve goal (set weightage) or reject (revert to Draft) |
| `GET` | `/team-aggregations` | ✅ | Manager+ | Get team-level weighted average completion |
| `GET` | `/company-aggregations` | ✅ | Admin | Get company-level goal aggregations |
| `PATCH` | `/transfer-ownership` | ✅ | Admin | Transfer goal ownership on team change |
| `PATCH` | `/company-goals/:id/update` | ✅ | Admin | Update company goal + notify cascaded owners |
| `PATCH` | `/company-goals/:id/acknowledge` | ✅ | Any | Acknowledge company goal update |
| `GET` | `/active-count` | ✅ | Any | Get count of active goals (used by review blocking) |

### Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/pending` | ✅ | Get pending reviews (as subject or manager) |
| `GET` | `/history` | ✅ | Get closed reviews with cross-share enforcement |
| `POST` | `/:id/self-feedback` | ✅ | Submit self-feedback (progress + rating) |
| `POST` | `/:id/manager-feedback` | ✅ | Submit manager feedback (comments + rating) → auto-close |
| `PATCH` | `/:id/schedule` | ✅ | Schedule discussion date + email notification |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/dashboard-stats` | ✅ | Admin | Compliance rate, flagged queue, pattern alerts |
| `GET` | `/org-aggregation` | ✅ | Admin | Company/Team/Individual goal counts + avg completion |
| `GET` | `/company-aggregations` | ✅ | Admin | Company-wide weighted aggregations |
| `GET` | `/org-goals` | ✅ | Admin | All goals across the organization |
| `GET` | `/mom-comparison` | ✅ | Admin | Month-over-month review + flag analytics |
| `GET` | `/export-csv` | ✅ | Admin | Download full review data as CSV |
| `GET` | `/active-probations` | ✅ | Admin | List employees on active probation |
| `PATCH` | `/probation/:userId` | ✅ | Admin | Confirm / Extend / Review Further |
| `PATCH` | `/probation/:userId/pause` | ✅ | Admin | Toggle probation pause/active |
| `PATCH` | `/probation/:userId/reassign` | ✅ | Admin | Reassign manager mid-probation |
| `PATCH` | `/resolve-review/:id` | ✅ | Admin | Waive / Extend / Escalate flagged review |

### Admin Cycles (`/api/admin`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/cycles` | ✅ | Admin | List all active/closed/finalized cycles |
| `GET` | `/cycles/:cycleId` | ✅ | Admin | Cycle detail with stats + unsubmitted list |
| `PATCH` | `/cycles/:cycleId/close` | ✅ | Admin | Manually close a cycle |
| `POST` | `/reviews/bulk-extend` | ✅ | Admin | Bulk extend multiple reviews |
| `POST` | `/reviews/bulk-waive` | ✅ | Admin | Bulk waive multiple reviews |
| `GET` | `/reviews/:reviewId/audit-trail` | ✅ | Admin | Get full audit log for a review |

---

## ⏰ Cron Jobs & Automation Engine

All cron jobs run within the Node.js server process using `node-cron`.

### 1. Probation Cron (`probationCron.js`)
| Schedule | `0 0 * * *` (Daily at midnight) |
|----------|------|
| **Logic** | Iterates all users with `probationStatus: 'Active'`. Calculates **business days** since `dateOfJoining`. At Day **30**, **60**, or **80**, creates a `Probation_X` review and emails both the employee and their manager. |
| **Guards** | Skips if review already exists. Skips if no `managerId` assigned. |

### 2. Cycle Trigger Cron (`cycleCron.js`)
| Schedule | `5 0 1 * *` (1st of every month at 12:05 AM) |
|----------|------|
| **Logic** | Checks if current month triggers Bi-Annual (Feb/Aug) or Quarterly (Jan/Apr/Jul/Oct). Creates a `Cycle` record with open/close/finalize dates. Finds eligible users (joined 60+ days ago, matching `reviewTrack`). Creates `Review` records for each user. |
| **Close/Finalize** | `0 10 * * *` (Daily at 10 AM) — Finds cycles whose `closeDate` or `finalizeDate` has arrived. Transitions status: `Open → Closed → Finalized`. Emails managers and HR with statistics. |

### 3. Reminder Cron (`reminderCron.js`)
| Schedule | `0 2 * * *` (Daily at 2:00 AM) |
|----------|------|
| **Cycle Reminders** | **5th** — Gentle nudge to employee+manager. **15th** — Urgent reminder. **22nd** — Auto-flag + hard escalation to all Admins. |
| **Probation Reminders** | **+2d, +4d, +6d** — Reminders to employee+manager. **+7d** — Auto-flag + Admin escalation. |
| **Goal Approval** | Goals `Pending Approval` for **5+ business days** → Auto-escalate to Admin. |
| **Flag Aging** | Flagged reviews with **no admin action for 7+ days** → Auto-stamp `AUTO-ESCALATED` context note + urgent Admin email (prevents re-trigger). |

### 4. Cycle Finalization Cron (`cycleFinalizationCron.js`)
| Schedule | `0 3 * * *` (Daily at 3:00 AM) |
|----------|------|
| **Logic** | On the **26th** (Bi-Annual) or **16th** (Quarterly), finds `Closed` cycles and finalizes them. Snapshots unsubmitted reviews. Updates cycle statistics. Emails all Admins with summary report. |

---

## 🔐 Role-Based Access Control (RBAC)

### Middleware Guards

| Guard | Description |
|-------|-------------|
| `protect` | Verifies JWT token → attaches `req.user` |
| `admin` | Requires `req.user.role === 'Admin'` |
| `manager` | Requires `req.user.role` is `'Manager'` or `'Admin'` |

### Permission Matrix

| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| Create goal | ✅ | ✅ | ✅ |
| View own goals | ✅ | ✅ | ✅ |
| View team goals | ❌ | ✅ | ✅ |
| Approve/reject goals | ❌ | ✅ | ✅ |
| Submit self-feedback | ✅ | ✅ | ✅ |
| Submit manager feedback | ❌ | ✅ | ✅ |
| View dashboard stats | ❌ | ❌ | ✅ |
| Resolve flagged reviews | ❌ | ❌ | ✅ |
| Manage probation | ❌ | ❌ | ✅ |
| Export CSV | ❌ | ❌ | ✅ |
| Manage cycles | ❌ | ❌ | ✅ |

---

## 🖥 Frontend Architecture

### Views & Navigation

The app uses **state-driven routing** via `useState`:

| State | View |
|-------|------|
| `LANDING` | Marketing landing page with product features, pricing, resources |
| `AUTH` | Login / Register form with role selection |
| `DASHBOARD` | Sidebar + topbar shell with tab-based navigation |

### Dashboard Tabs

| Tab | Component | Available To |
|-----|-----------|-------------|
| **Dashboard** | `EmployeeDashboard` / `ManagerDashboard` / `AdminDashboard` | All (role-specific) |
| **Goals (GMS)** | `GoalsGMS` | All |
| **Feedback Forms** | `FeedbackForms` | All |
| **Notifications** | _(Under construction)_ | All |
| **System Settings** | _(Under construction)_ | Admin only |

### State Management

| Context | Responsibility |
|---------|---------------|
| `AuthContext` | User object, JWT token, login/register/logout functions |
| `ModalContext` | System-wide `showAlert()`, `showConfirm()`, `showPrompt()` dialogs |

### Design System

The CSS design system (`index.css`) defines:
- **CSS Variables** — Colors, spacing, typography scales
- **Color Palette** — Primary (`#001F1F`), Accent (`#046645`), Secondary (`#31B88C`), Success/Warning/Danger
- **Animations** — `animate-fade-in`, `animate-slide-up`, `animate-slide-in`, `animate-float`
- **Components** — Cards, buttons, forms, tags, sidebar, topbar

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (Atlas cloud or local instance)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd PMS_

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Configure Environment

Create or edit `server/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
PORT=5001
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-pass
```

### Run the Application

```bash
# Terminal 1 — Start the backend server
cd server
npm run start        # or: npm run dev (with nodemon)

# Terminal 2 — Start the frontend dev server
cd client
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| Swagger Docs | http://localhost:5001/api-docs |

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ | `mongodb://127.0.0.1:27017/pms_db` | MongoDB connection string |
| `PORT` | ❌ | `5001` | Server port |
| `JWT_SECRET` | ✅ | `secret123` | JWT signing secret |
| `CLIENT_URL` | ❌ | `http://localhost:5173` | Frontend URL |
| `EMAIL_HOST` | ❌ | `smtp.ethereal.email` | SMTP host |
| `EMAIL_PORT` | ❌ | `587` | SMTP port |
| `EMAIL_USER` | ❌ | `ethereal_user` | SMTP username |
| `EMAIL_PASS` | ❌ | `ethereal_pass` | SMTP password |

---

## 🧠 Design Decisions

| Decision | Rationale |
|----------|-----------|
| **State-driven routing** over React Router pages | Simpler navigation for a dashboard-centric SPA. All views are tab-based within a sidebar shell. |
| **Business days** for probation calculation | Probation milestones must exclude weekends to be legally compliant. |
| **Non-blocking emails** | Email failures are caught and logged but never crash the parent controller. |
| **Audit log within Review document** | Co-locating audit data with the review document avoids cross-collection joins and ensures atomicity. |
| **Weighted goal aggregation** | Simple average would give equal importance to a 5% goal and a 50% goal; weighted average reflects real impact. |
| **Soft/Hard flag separation** | Soft flags (blank responses) are informational; hard flags (Below rating, negative sentiment) require admin action. |
| **Cross-share gating** | Employees must submit self-feedback before seeing manager feedback — prevents anchoring bias. |
| **Goal blocking on reviews** | Self-rating blocked with zero active goals ensures employees have measurable objectives before being evaluated. |
| **`AUTO-ESCALATED` stamp** | Prevents the 7-day aging cron from re-escalating the same review every day. |
| **Monolithic architecture** | Appropriate for current scale. Cron jobs run in-process. Can be extracted to microservices later. |

---

## 🗺 Future Roadmap

- [ ] **Multi-tenancy** — Organization/company isolation
- [ ] **SSO Integration** — SAML/OIDC for enterprise auth
- [ ] **PDF Report Generation** — Exportable review summaries
- [ ] **Real-time Notifications** — WebSocket-based notification system
- [ ] **Advanced Analytics** — Charts, trend lines, department comparisons
- [ ] **Leave Integration** — Auto-pause probation clock during leave
- [ ] **360° Feedback** — Peer reviews and skip-level feedback
- [ ] **Mobile Responsive** — Full mobile-first responsive design
- [ ] **Rate Limiting** — API throttling for production security
- [ ] **Test Suite** — Unit + integration tests (Jest + Supertest)

---

<p align="center">
  <strong>Built with ❤️ for enterprise performance at scale.</strong>
</p>
