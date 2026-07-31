const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Parallel queries
        const [totalStaffRows] = await db.execute('SELECT COUNT(*) as count FROM staff WHERE status = "Active"');
        const totalStaff = totalStaffRows[0].count;

        const [attendanceRows] = await db.execute(
            'SELECT status, COUNT(*) as count FROM attendance WHERE date = ? GROUP BY status',
            [today]
        );

        let present = 0;
        let late = 0;
        let absent = 0; // This logic might need refinement if 'Absent' isn't explicitly inserted until end of day

        attendanceRows.forEach(row => {
            if (row.status === 'Present') present = row.count;
            if (row.status === 'Late') late = row.count;
            if (row.status === 'Absent') absent = row.count;
        });

        // Simple calculation for "Absent" as Total - (Present + Late) so far today
        // This is a dynamic "Not Checked In yet" count effectively
        const checkedInCount = present + late;
        const notCheckedIn = totalStaff - checkedInCount;

        res.json({
            totalStaff: totalStaff,
            present: present,
            late: late,
            absent: notCheckedIn // Showing "Not Checked In" as Absent for dashboard clarity
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
