const db = require('../config/db');
const aiService = require('../services/ai.service');

exports.getOverviewStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Count Present, Late
        const [attendanceCounts] = await db.execute(`
            SELECT status, COUNT(*) as count 
            FROM attendance 
            WHERE date = ? 
            GROUP BY status
        `, [today]);

        // Count Total Staff for Absent calculation
        const [totalStaff] = await db.execute('SELECT COUNT(*) as count FROM staff WHERE status = "Active"');

        let stats = {
            totalStaff: 0,
            Present: 0,
            Late: 0,
            Absent: 0
        };

        let checkedInCount = 0;

        attendanceCounts.forEach(row => {
            stats[row.status] = row.count;
            checkedInCount += row.count;
        });

        // Abstract calc for absent: Total - CheckedIn
        stats.totalStaff = totalStaff[0].count;
        stats.Absent = totalStaff[0].count - checkedInCount;
        if (stats.Absent < 0) stats.Absent = 0; // Just in case

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getLatenessTrend = async (req, res) => {
    try {
        // Last 7 days
        const [rows] = await db.execute(`
            SELECT date, COUNT(*) as count 
            FROM attendance 
            WHERE status = 'Late' AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getPunctualityTrend = async (req, res) => {
    try {
        // Last 7 days
        const [rows] = await db.execute(`
            SELECT date, COUNT(*) as count 
            FROM attendance 
            WHERE status = 'Present' AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getDrillDown = async (req, res) => {
    const { type } = req.query; // 'Present', 'Late', 'Absent'
    const today = new Date().toISOString().split('T')[0];

    try {
        let rows = [];
        if (type === 'Absent') {
            [rows] = await db.execute(`
                SELECT s.name, s.department, 'Absent' as status, '-' as check_in_time, '${today}' as date
                FROM staff s
                WHERE s.staff_id NOT IN (
                    SELECT staff_id FROM attendance WHERE date = ?
                ) AND s.status = 'Active'
            `, [today]);
        } else {
            [rows] = await db.execute(`
                SELECT s.name, s.department, a.status, TIME_FORMAT(a.check_in_time, '%H:%i') as check_in_time, a.date
                FROM attendance a
                JOIN staff s ON a.staff_id = s.staff_id
                WHERE a.date = ? AND a.status = ?
            `, [today, type]);
        }
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.chatWithAI = async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    const response = await aiService.processQuery(query);
    res.json(response);
};

exports.sanctionStaff = async (req, res) => {
    const { staff_id, type, reason } = req.body;
    // Assume admin_id comes from session or middleware (mocked as 1 for now if missing)
    const admin_id = req.session && req.session.adminId ? req.session.adminId : 1;

    try {
        await db.execute(`
            INSERT INTO sanctions (staff_id, type, reason) VALUES (?, ?, ?)
        `, [staff_id, type, reason]);

        await db.execute(`
            INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)
        `, [admin_id, 'Sanction Issued', `Sanctioned staff ${staff_id} with ${type}`]);

        // Send Notification
        await db.execute(`
            INSERT INTO notifications (staff_id, title, message) VALUES (?, ?, ?)
        `, [staff_id, `Sanction Applied: ${type}`, `You have been sanctioned: ${type}. Reason: ${reason}`]);

        res.json({ success: true, message: 'Sanction applied successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
