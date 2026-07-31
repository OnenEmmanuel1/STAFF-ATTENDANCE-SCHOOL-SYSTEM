const db = require('../config/db');

class Attendance {
    static async create(staffId, date, checkInTime, ipAddress, status = 'Present') {
        const [result] = await db.execute(
            'INSERT INTO attendance (staff_id, date, check_in_time, status, ip_address) VALUES (?, ?, ?, ?, ?)',
            [staffId, date, checkInTime, status, ipAddress] // Corrected order to match SQL
        );
        return result;
    }

    static async findTodayAttendance(staffId, date) {
        const [rows] = await db.execute(
            'SELECT * FROM attendance WHERE staff_id = ? AND date = ?',
            [staffId, date]
        );
        return rows[0];
    }

    static async updateCheckOut(attendanceId, checkOutTime) {
        const [result] = await db.execute(
            'UPDATE attendance SET check_out_time = ? WHERE attendance_id = ?',
            [checkOutTime, attendanceId]
        );
        return result;
    }

    static async getHistory(staffId) {
        const [rows] = await db.execute(
            'SELECT * FROM attendance WHERE staff_id = ? ORDER BY date DESC, check_in_time DESC',
            [staffId]
        );
        return rows;
    }
}

module.exports = Attendance;
