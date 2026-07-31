const express = require('express');
const router = express.Router();
const path = require('path');
const adminAuthController = require('../controllers/admin.auth.controller');
const { isAdminAuthenticated, isAdminGuest } = require('../middlewares/admin.auth.middleware');

// Auth Routes
router.get('/login', isAdminGuest, adminAuthController.getLoginPage);
router.post('/auth/login', isAdminGuest, adminAuthController.login);
router.get('/logout', adminAuthController.logout);

// Controllers
const adminDashboardController = require('../controllers/admin.dashboard.controller');
const adminChatController = require('../controllers/admin.chat.controller');
const adminUIController = require('../controllers/admin.ui.controller');

// Dashboard (Visual)
router.get('/dashboard', isAdminAuthenticated, (req, res) => {
    res.render('admin/dashboard');
});

// Chat (Optional Link)
router.get('/chat', isAdminAuthenticated, adminChatController.getChatPage);
router.post('/api/chat', isAdminAuthenticated, adminChatController.processMessage);

// New Staff UI
router.get('/add-staff', isAdminAuthenticated, adminUIController.getAddStaffPage);

router.get('/api/stats', isAdminAuthenticated, adminDashboardController.getDashboardStats); // Restored


// Staff Management
router.get('/staff', isAdminAuthenticated, (req, res) => {
    res.render('admin/staff-list');
});

// APIs
const adminStaffController = require('../controllers/admin.staff.controller');
router.get('/api/staff', isAdminAuthenticated, adminStaffController.getAllStaff);
router.get('/api/staff/attendance', isAdminAuthenticated, adminStaffController.getStaffAttendance);
router.post('/api/staff/create', isAdminAuthenticated, adminStaffController.createStaff);
router.post('/api/staff/update', isAdminAuthenticated, adminStaffController.updateStaff);
router.post('/api/staff/toggle', isAdminAuthenticated, adminStaffController.toggleStatus);

// Attendance & Settings (Previous failed edit chunks are added here too)
const adminAttendanceController = require('../controllers/admin.attendance.controller');
router.get('/attendance', isAdminAuthenticated, (req, res) => {
    res.render('admin/attendance-log');
});
router.get('/api/attendance', isAdminAuthenticated, adminAttendanceController.getAttendanceLogs);

const adminSettingsController = require('../controllers/admin.settings.controller');
router.get('/settings', isAdminAuthenticated, adminSettingsController.getSettingsPage);
router.get('/api/settings', isAdminAuthenticated, adminSettingsController.getSettings);
router.post('/api/settings', isAdminAuthenticated, adminSettingsController.updateSettings);

// Advanced Module APIs
const adminApiController = require('../controllers/admin.api.controller');

// Charts
router.get('/api/stats/overview', isAdminAuthenticated, adminApiController.getOverviewStats);
router.get('/api/stats/lateness', isAdminAuthenticated, adminApiController.getLatenessTrend);
router.get('/api/stats/punctuality', isAdminAuthenticated, adminApiController.getPunctualityTrend);

// Drill-Down
router.get('/api/staff/drilldown', isAdminAuthenticated, adminApiController.getDrillDown);

// AI Chatbot
router.post('/api/chat/query', isAdminAuthenticated, adminApiController.chatWithAI); // New specific endpoint to avoid conflict if needed, or replace existing

// Sanctions
router.post('/api/staff/sanction', isAdminAuthenticated, adminApiController.sanctionStaff);

module.exports = router;
