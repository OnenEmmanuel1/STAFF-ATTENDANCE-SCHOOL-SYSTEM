const db = require('../config/db');
const bcrypt = require('bcrypt');

// Helper to get all staff
exports.getAllStaff = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT staff_id, name, email, department, status, profile_pic, created_at FROM staff ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create Staff
exports.createStaff = async (req, res) => {
    const { name, email, password, department } = req.body;
    const profile_pic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;

    try {
        // Check if email exists
        const [existing] = await db.execute('SELECT email FROM staff WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO staff (name, email, password, department, status, profile_pic) VALUES (?, ?, ?, ?, "Active", ?)',
            [name, email, hashedPassword, department, profile_pic]
        );
        res.json({ success: true, message: 'Staff created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Staff
exports.updateStaff = async (req, res) => {
    const { staff_id, name, email, department, status } = req.body;
    const profile_pic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;

    try {
        if (profile_pic) {
            await db.execute(
                'UPDATE staff SET name = ?, email = ?, department = ?, status = ?, profile_pic = ? WHERE staff_id = ?',
                [name, email, department, status, profile_pic, staff_id]
            );
        } else {
            await db.execute(
                'UPDATE staff SET name = ?, email = ?, department = ?, status = ? WHERE staff_id = ?',
                [name, email, department, status, staff_id]
            );
        }
        res.json({ success: true, message: 'Staff updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Toggle Status (Quick action)
exports.toggleStatus = async (req, res) => {
    const { staff_id } = req.body;
    try {
        const [rows] = await db.execute('SELECT status FROM staff WHERE staff_id = ?', [staff_id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });

        const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';
        await db.execute('UPDATE staff SET status = ? WHERE staff_id = ?', [newStatus, staff_id]);

        res.json({ success: true, newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Staff Attendance History
exports.getStaffAttendance = async (req, res) => {
    const { staff_id } = req.query;
    try {
        if (!staff_id) {
            return res.status(400).json({ error: 'Staff ID is required' });
        }

        // Get staff details
        const [staffRows] = await db.execute(
            'SELECT staff_id, name, email, department, profile_pic FROM staff WHERE staff_id = ?',
            [staff_id]
        );

        if (staffRows.length === 0) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        // Get attendance records
        const [attendanceRows] = await db.execute(
            'SELECT date, check_in_time, check_out_time, status FROM attendance WHERE staff_id = ? ORDER BY date DESC LIMIT 100',
            [staff_id]
        );

        res.json({
            staff: staffRows[0],
            attendance: attendanceRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
