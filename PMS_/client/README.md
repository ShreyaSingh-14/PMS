# Performance Management System - Frontend

This is the frontend application for the Performance Management System (PMS), built with React and Vite. It provides a user interface for employees, managers, and administrators to manage performance reviews, goals, feedback, and administrative tasks.

## Features

### Dashboards
- **Admin Dashboard**: Allows administrators to oversee system-wide operations, manage users, and access administrative controls.
- **Manager Dashboard**: Enables managers to review team performance, approve goals, and provide feedback.
- **Employee Dashboard**: Provides employees with access to their personal goals, reviews, and feedback forms.

### Components
- **FeedbackForms**: Interactive forms for submitting and managing performance feedback.
- **GoalsGMS**: Goal Management System component for setting, tracking, and updating employee goals.

### Context Providers
- **AuthContext**: Manages user authentication state and provides login/logout functionality.
- **ModalContext**: Handles modal dialogs throughout the application for user interactions.

### API Integration
- **api.js**: Centralized API client for communicating with the backend server, handling HTTP requests for authentication, goals, reviews, and administrative functions.

## Technologies Used
- **React**: JavaScript library for building user interfaces.
- **Vite**: Fast build tool and development server.
- **ESLint**: Linting tool for code quality.

## Project Structure
```
client/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and other assets
│   ├── components/        # Reusable UI components
│   │   ├── FeedbackForms.jsx
│   │   ├── GoalsGMS.jsx
│   │   └── dashboards/
│   │       ├── AdminDashboard.jsx
│   │       ├── EmployeeDashboard.jsx
│   │       └── ManagerDashboard.jsx
│   ├── context/           # React context providers
│   │   ├── AuthContext.jsx
│   │   └── ModalContext.jsx
│   ├── api.js             # API client
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── eslint.config.js       # ESLint configuration
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```

### Development
Start the development server:
```
npm run dev
```
The application will be available at `http://localhost:5173` (default Vite port).

### Build
Build the application for production:
```
npm run build
```

### Preview
Preview the production build:
```
npm run preview
```

## ESLint Configuration
This project uses ESLint for code linting. The configuration is in `eslint.config.js`. For production applications, consider using TypeScript with type-aware lint rules. Refer to the [Vite React TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for TypeScript integration.

## React Compiler
The React Compiler is not enabled by default due to performance impacts. To enable it, follow the [React Compiler installation guide](https://react.dev/learn/react-compiler/installation).
