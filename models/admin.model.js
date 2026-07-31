const db = require('../config/db');

class Admin {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM admins WHERE admin_id = ?', [id]);
        return rows[0];
    }
}

module.exports = Admin;
