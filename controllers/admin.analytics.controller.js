const db = require('../config/db');

exports.getAnalyticsPage = (req, res) => {
    res.sendFile(require('path').join(__dirname, '../views/admin', 'analytics.html'));
};

exports.getDailyStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.execute(
            'SELECT status, COUNT(*) as count FROM attendance WHERE date = ? GROUP BY status',
            [today]
        );

        let stats = { Present: 0, Late: 0, Absent: 0 };
        rows.forEach(r => {
            if (stats.hasOwnProperty(r.status)) {
                stats[r.status] = r.count;
            }
        });

        // Absent logic: Total Active Staff - (Present + Late)
        const [totalRows] = await db.execute('SELECT COUNT(*) as c FROM staff WHERE status="Active"');
        const total = totalRows[0].c;
        const checkedIn = stats.Present + stats.Late;
        stats.Absent = Math.max(0, total - checkedIn);

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMonthlyStats = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT DATE_FORMAT(date, '%Y-%m-%d') as day, COUNT(*) as count 
            FROM attendance 
            WHERE MONTH(date) = MONTH(CURRENT_DATE()) 
            AND YEAR(date) = YEAR(CURRENT_DATE())
            AND status = 'Present'
            GROUP BY day
            ORDER BY day ASC
        `);

        // Fill in missing days? Chart.js can handle sparse data, or we can zero-fill. 
        // For simplicity, returning sparse data which Chart.js plots fine on time-scale or category.
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
