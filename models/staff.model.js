const db = require('../config/db');

class Staff {
    static async ensureProfilePicColumn() {
        try {
            await db.execute('ALTER TABLE staff ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL');
        } catch (e) {
            // Column already exists, ignore
        }
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM staff WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM staff WHERE staff_id = ?', [id]);
        return rows[0];
    }

    static async updateProfilePic(staffId, imagePath) {
        try {
            const [result] = await db.execute('UPDATE staff SET profile_pic = ? WHERE staff_id = ?', [imagePath, staffId]);
            return result;
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && (err.message.includes('Unknown column') || err.message.includes('profile_pic')))) {
                await this.ensureProfilePicColumn();
                const [retryResult] = await db.execute('UPDATE staff SET profile_pic = ? WHERE staff_id = ?', [imagePath, staffId]);
                return retryResult;
            }
            throw err;
        }
    }

    static async updateProfile(staffId, { name, email }) {
        const [result] = await db.execute('UPDATE staff SET name = ?, email = ? WHERE staff_id = ?', [name, email, staffId]);
        return result;
    }
}

module.exports = Staff;
