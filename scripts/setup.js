const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL...');

        // 1. Create Tables
        const sql = fs.readFileSync(path.join(__dirname, '../database.sql'), 'utf8');
        await connection.query(sql);
        console.log('Database schema updated.');

        // 2. Set Admin Password correctly
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.execute(
            'UPDATE admins SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@school.edu']
        );
        console.log('Admin password updated to "admin123".');

    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await connection.end();
    }
}

setup();
