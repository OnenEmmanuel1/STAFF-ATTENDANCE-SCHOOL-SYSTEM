# Staff Attendance Monitoring System (AttendTrack)

A complete, production-ready full-stack web application built with Node.js, Express, EJS, and MySQL.

## Description
**AttendTrack** is a centralized Staff Attendance Monitoring System designed for educational institutions and corporate environments. It streamlines daily attendance logging, automates lateness and absence management, and simplifies leave workflows across multi-tier organizational roles:

- **Staff Members**: Can clock in/out daily, view personal attendance history, check live status, and upload profile pictures.
- **Supervisors (Department Heads)**: Can monitor real-time attendance for their team members, evaluate leave requests, and view department metrics.
- **Administrators**: Maintain system-wide settings, set global working hours & lateness policies, manage user accounts, assign departments, and generate organizational reports.

The system features session-based role authentication, CSRF protection, rate-limiting, and profile picture management.

## Features
- Role-based access control (Staff, Supervisor, Admin)
- Daily clock-in/clock-out tracking with IP filtering
- Profile picture upload & management
- Interactive Staff & Admin Dashboards
- Automated tardiness & attendance reporting
- MySQL database with auto-migration and seeding scripts

## Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL Server

### Database Setup & Seeding
1. Configure database credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=attendance_system
   SESSION_SECRET=your_secret_key
   PORT=3000
   ```
2. Run database seed script:
   ```bash
   node scripts/seed.js
   ```

### Running the Application
```bash
npm install
npm start
```
The application will run at `http://localhost:3000`.

### Default Credentials
- **Admin**: `admin@school.edu` / `admin123`
- **Staff**: `john@example.com` / `password123`
