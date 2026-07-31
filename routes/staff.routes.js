const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/dashboard', isAuthenticated, attendanceController.getDashboardPage);
router.get('/api/dashboard', isAuthenticated, attendanceController.getDashboardData);
router.get('/profile', isAuthenticated, attendanceController.getProfilePage);
router.get('/api/profile', isAuthenticated, attendanceController.getProfileData);
router.post('/api/profile/avatar', isAuthenticated, upload.single('profile_pic'), attendanceController.uploadProfilePic);
router.post('/api/profile/update', isAuthenticated, attendanceController.updateProfileData);
router.post('/check-in', isAuthenticated, attendanceController.checkIn);
router.post('/check-out', isAuthenticated, attendanceController.checkOut);
router.get('/api/notifications', isAuthenticated, attendanceController.getNotifications);

module.exports = router;
