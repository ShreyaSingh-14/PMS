# 🚀 Performance & Goal Management Platform (PMS)
**Unified Product Solution | March 2026**

## 1. Overview
PMS is an enterprise Performance & Goal Management Platform that unifies probation tracking, bi-annual and quarterly performance reviews, and structured goal management into a single role-based system.

The **Goal Management System (GMS)** is a core module within PMS — not a standalone product. It shares the same role model, data layer, and interface as the broader platform. PMS replaces fragmented email threads, spreadsheets, and informal feedback with automated workflows, structured forms, and real-time dashboards. The platform serves three roles — **Employee, Manager, and Admin** — each with a tailored experience.

---

## 🛠️ Technical Stack

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Token (JWT) with Role-Based Access Control (RBAC)
- **Email Engine**: Nodemailer (Asynchronous SMTP Processing)
- **Automation**: `node-cron` for probation triggers and cycle notifications
- **Documentation**: Swagger UI (OpenAPI 3.0)

### Frontend (`/client`)
- **Library**: React 19 (Vite)
- **Styling**: Vanilla CSS (Rich Custom Design System with Glassmorphism)
- **Icons**: Lucide-React
- **State Management**: React Context API
- **Routing**: React Router Dom v7

---

## 📂 Project Structure

### Backend Architecture
```text
server/
├── config/             # Database & Swagger configurations
├── controllers/        # Business logic for Admin, Goals, Reviews, and Auth
├── middleware/         # Auth protection and case-insensitive role validation
├── models/             # Mongoose schemas (User, Goal, Review)
├── routes/             # Express API route definitions
├── services/           # Cron job service layers (probation, reminders, cycles)
├── utils/              # Resilient mailer engine (sendEmail.js)
└── server.js           # Main entry point and server initialization
```

#### Backend Modules Details
- **Controllers**:
  - `adminController.js`: Handles administrative operations like user management, system oversight, and compliance monitoring.
  - `authController.js`: Manages user authentication, JWT token generation, and role-based access control.
  - `goalController.js`: Implements CRUD operations for goals, approval workflows, and goal hierarchy management.
  - `reviewController.js`: Processes performance reviews, feedback submissions, and cycle management.

- **Models**:
  - `User.js`: Defines user schema with roles (Employee, Manager, Admin), authentication details, and profile information.
  - `Goal.js`: Represents goal entities with status tracking, weightage, approval states, and hierarchical relationships.
  - `Review.js`: Manages review cycles, feedback forms, ratings, and probation tracking.

- **Routes**:
  - `adminRoutes.js`: API endpoints for administrative functions and system management.
  - `authRoutes.js`: Authentication-related routes including login, logout, and token validation.
  - `goalRoutes.js`: Endpoints for goal creation, updates, approvals, and retrieval.
  - `reviewRoutes.js`: Routes for review cycles, feedback submission, and performance tracking.

- **Services**:
  - `cycleCron.js`: Automated scheduling for performance review cycles (bi-annual and quarterly).
  - `probationCron.js`: Handles probation period triggers and automated email notifications.
  - `reminderCron.js`: Manages reminder emails and escalation alerts for pending actions.

- **Utils**:
  - `sendEmail.js`: Utility for sending emails using Nodemailer, supporting SMTP for notifications and alerts.

- **Config**:
  - `db.js`: MongoDB connection setup and database configuration.
  - `swagger.js`: Swagger/OpenAPI documentation configuration for API endpoints.

- **Middleware**:
  - `authMiddleware.js`: JWT authentication middleware with role-based access control and case-insensitive validation.

- **Server**:
  - `server.js`: Main application entry point, sets up Express server, middleware, routes, and starts the server on specified port.

### Frontend Architecture
```text
client/
├── src/
│   ├── components/     # Functional UI components (GMS, Feedback Forms)
│   ├── dashboards/     # Role-specific dashboard layouts (Admin, Manager, Employee)
│   ├── context/        # Global state (ModalContext, Auth hooks)
│   ├── api.js          # Unified Axios instance for backend communication
│   ├── index.css       # Core design system and global styles
│   └── App.jsx         # Main routing and application layout
```

---

## 👥 Users & Roles

| Feature | Employee | Manager | Admin (HR) |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Personal goals + feedback history + self-feedback | Team goals + ratings + pending approvals | Org-level overview + flagged responses + compliance |
| **Goal management** | Create, edit, update own goals (pending approval) | Create, assign, weight, approve/reject team goals | Set company-wide goals, approve any goal, manage structure |
| **Goal approval** | Submit goals for approval | Approve or reject employee goals | Approve or reject any goal |
| **Feedback forms** | Submit self-feedback at each trigger | Submit manager feedback + final rating | View all submissions, flag red flags |
| **Review cycles** | Receive cycle emails, submit self-rating | Initiate discussion, submit final rating | Trigger cycles, monitor compliance |
| **Notifications** | Trigger emails + reminder nudges + approval status | Trigger emails + escalation alerts + approval queue | Escalation inbox + weekly digest |

---

## 📋 Core Modules

### 5.1 Probation Monitoring
Automated email triggers go out from the employee's date of joining (DOJ) at Day 30, Day 60, and Day 80.
- **Cycle**: Day 30 (Initial), Day 60 (Mid), Day 80 (Final - 10 days before confirmation).
- **Automation**: Reminders at +2 days; escalation to Admin after 7 days if pending.
- **Edge Cases**: Leave pauses the clock; Manager transfers reassign pending forms automatically.

### 5.2 Performance Review Cycles
- **Bi-Annual**:
    - Cycle 1: April–September (Trigger Aug 1, Close Aug 25)
    - Cycle 2: October–March (Trigger Feb 1, Close Feb 25)
- **Quarterly**: (Select roles/Leadership) Triggered 1st of Jan, Apr, Jul, Oct.
- **Eligibility**: Cutoff is 60 days before cycle close.

### 5.3 Goal Management System (GMS)
GMS is the goal tracking module within PMS. 
- **Goal Hierarchy**: Company → Team → Individual.
- **Weightage**: Auto-aggregates completion % to team/company levels.
- **Flow**: `Draft` ➡ `Pending Approval` ➡ `Active` ➡ `Completed` / `Archived`.
- **Approval Flow**: Manager/Admin must approve employee-created goals to set weightage and make them Active.

### 5.4 Feedback & Flag Module
- **Cross-share Logic**: Forms shared only after both parties submit.
- **Red Flags**: Triggered by scores <= 2/5 or negative open-ended responses.
- **Pattern Detection**: Alerts surfaced for repeat flags across consecutive cycles.

---

## ⚡ Automation Logic & Rules

| Trigger | Timing | Action if Missed |
| :--- | :--- | :--- |
| **Probation Triggers** | DOJ + 30/60/80 working days | Reminder +2d, +4d, +6d; Admin at +7d |
| **Bi-Annual Cycle** | Aug 1 / Feb 1 | Remind 5th, 15th; Admin 22nd |
| **Goal Approval** | On Submission | Auto-escalate to Admin after 5 business days |

---

## 🚀 Setup & Installation

1. **Clone the Repository**
2. **Install Dependencies**
   ```bash
   # Server installation
   cd server && npm install
   
   # Client installation
   cd ../client && npm install
   ```
3. **Environment Setup**
   Create a `.env` file in the `/server` directory:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_smtp_email
   EMAIL_PASS=your_smtp_password
   PORT=5001
   ```
4. **Run the Application**
   - **Backend**: `npm run dev` (starts on port 5001)
   - **Frontend**: `npm run dev` (starts on Vite default port)

---

## 📈 Prioritization (PRD Focus)
- **P0**: Core CRUD, Probation triggers, GMS Approvals, Admin Dashboard.
- **P1**: Reminders/Escalations, Org-level aggregation, Notification Inbox.
- **P2**: Red-flag auto-tagging, Pattern detection, Month-over-month trend analysis.

---
*PMS Platform — Bridging the gap between employee ownership and leadership oversight.*
