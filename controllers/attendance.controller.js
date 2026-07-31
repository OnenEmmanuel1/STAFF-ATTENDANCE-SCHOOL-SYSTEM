const path = require('path');
const Attendance = require('../models/attendance.model');
const Staff = require('../models/staff.model');

exports.getDashboardPage = (req, res) => {
    res.render('staff-dashboard');
};

exports.getProfilePage = (req, res) => {
    res.render('staff-profile');
};

exports.getDashboardData = async (req, res) => {
    try {
        const staffId = req.session.staffId;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        const staff = await Staff.findById(staffId);
        const todayAttendance = await Attendance.findTodayAttendance(staffId, today);
        const history = await Attendance.getHistory(staffId);

        // Calculate Stats for Dashboard
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRecords = history.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        });

        const stats = {
            daysPresent: monthlyRecords.filter(r => r.status === 'Present').length,
            daysLate: monthlyRecords.filter(r => r.status === 'Late').length,
            daysAbsent: monthlyRecords.filter(r => r.status === 'Absent').length,
            lastCheckIn: history[0]?.check_in_time || 'N/A'
        };

        let status = 'Not Checked In';
        if (todayAttendance) {
            status = todayAttendance.check_out_time ? 'Checked Out' : 'Checked In';
        }

        // Check window status
        const Settings = require('../models/settings.model');
        const workStartTimeStr = await Settings.getValue('work_start_time') || '09:00';
        const workEndTimeStr = await Settings.getValue('work_end_time') || '17:00';

        const [startH, startM] = workStartTimeStr.split(':').map(Number);
        const [endH, endM] = workEndTimeStr.split(':').map(Number);

        const start = new Date(now); start.setHours(startH, startM, 0);
        const end = new Date(now); end.setHours(endH, endM, 0);

        const isWindowOpen = now >= start && now <= end;

        res.json({
            staff: { name: staff.name, department: staff.department, profile_pic: staff.profile_pic },
            status: status,
            stats: stats, // Added stats
            today: todayAttendance,
            history: history,
            window: {
                isOpen: isWindowOpen,
                start: workStartTimeStr,
                end: workEndTimeStr
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getProfileData = async (req, res) => {
    try {
        const staffId = req.session.staffId;
        const staff = await Staff.findById(staffId);
        const history = await Attendance.getHistory(staffId);

        // Calculate monthly stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyRecords = history.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        });

        const stats = {
            daysPresent: monthlyRecords.filter(r => r.status === 'Present').length,
            daysLate: monthlyRecords.filter(r => r.status === 'Late').length,
            daysAbsent: monthlyRecords.filter(r => r.status === 'Absent').length,
            lastCheckIn: history[0]?.check_in_time || 'N/A'
        };

        res.json({
            staff: {
                name: staff.name,
                email: staff.email,
                department: staff.department,
                staff_id: staff.staff_id,
                status: staff.status,
                profile_pic: staff.profile_pic
            },
            stats: stats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please select an image file to upload.' });
        }
        const staffId = req.session.staffId;
        const imagePath = `/uploads/profile_pics/${req.file.filename}`;

        await Staff.updateProfilePic(staffId, imagePath);

        res.json({
            success: true,
            message: 'Profile picture updated successfully!',
            profile_pic: imagePath
        });
    } catch (err) {
        console.error('Error uploading profile picture:', err);
        res.status(500).json({ error: err.message || 'Failed to upload profile picture' });
    }
};

exports.updateProfileData = async (req, res) => {
    try {
        const staffId = req.session.staffId;
        let { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }
        name = name.trim();
        email = email.trim();

        await Staff.updateProfile(staffId, { name, email });
        req.session.staffName = name;

        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const staffId = req.session.staffId;

        // Use a consistent locale-aware approach for today's date
        // Instead of ISOString which is UTC, use local string
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

        // IP Validation
        let ip = req.ip || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }

        // Fetch Settings
        const Settings = require('../models/settings.model');
        const allowedIPsStr = await Settings.getValue('allowed_ip_range');
        const workStartTimeStr = await Settings.getValue('work_start_time') || '09:00';
        const lateThresholdStr = await Settings.getValue('late_threshold_minutes') || '15';

        // 1. IP Check
        if (allowedIPsStr && allowedIPsStr.trim() !== '') {
            const allowedIPs = allowedIPsStr.split(',').map(i => i.trim());
            if (!allowedIPs.includes(ip) && ip !== '::1' && ip !== '127.0.0.1') {
                return res.status(403).json({ error: 'Check-in not allowed from this IP address' });
            }
        }

        const existing = await Attendance.findTodayAttendance(staffId, today);
        if (existing) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        // 2. Determine Status (Present vs Late)
        let status = 'Present';

        // Parse Work Start Time
        const [workHour, workMinute] = workStartTimeStr.split(':').map(Number);
        const workStartDate = new Date(now);
        workStartDate.setHours(workHour, workMinute, 0, 0);

        // Add Threshold
        const lateThreshold = parseInt(lateThresholdStr, 10);
        const lateLimitDate = new Date(workStartDate.getTime() + lateThreshold * 60000);

        if (now > lateLimitDate) {
            status = 'Late';
        }

        await Attendance.create(staffId, today, time, ip, status);
        res.json({ success: true, status: 'Checked In', attendanceStatus: status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const staffId = req.session.staffId;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];

        const existing = await Attendance.findTodayAttendance(staffId, today);
        if (!existing) {
            return res.status(400).json({ error: 'You must check in first' });
        }
        if (existing.check_out_time) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        await Attendance.updateCheckOut(existing.attendance_id, time);
        res.json({ success: true, status: 'Checked Out' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const staffId = req.session.staffId;
        const db = require('../config/db'); // Assuming basic connection
        const [rows] = await db.execute('SELECT * FROM notifications WHERE staff_id = ? ORDER BY created_at DESC LIMIT 10', [staffId]);
        res.json(rows);
    } catch (err) {
        console.error("Notification Error", err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
