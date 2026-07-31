const db = require('../config/db');

exports.getAttendanceLogs = async (req, res) => {
    try {
        const { date, department, status } = req.query;

        let query = `
            SELECT a.*, s.name as staff_name, s.department 
            FROM attendance a 
            JOIN staff s ON a.staff_id = s.staff_id 
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND a.date = ?';
            params.push(date);
        } else {
            // Default to today if no date provided? Or last 30 days?
            // Let's default to today for dashboard-like feel, or all time descending
            // Let's default to today to avoid overwhelming startup
            // Actually, "All time" desc limit 50 is better for logs
            // query += ' AND a.date = CURDATE()'; // Optional default
        }

        if (department && department !== 'All') {
            query += ' AND s.department = ?';
            params.push(department);
        }

        if (status && status !== 'All') {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.date DESC, a.check_in_time DESC LIMIT 100';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
