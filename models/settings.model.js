const db = require('../config/db');

class Settings {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        return settings;
    }

    static async update(key, value) {
        const [result] = await db.execute(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, value, value]
        );
        return result;
    }

    static async getValue(key) {
        const [rows] = await db.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
        return rows[0] ? rows[0].setting_value : null;
    }
}

module.exports = Settings;
