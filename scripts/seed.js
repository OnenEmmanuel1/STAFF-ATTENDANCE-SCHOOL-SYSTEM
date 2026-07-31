const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSeed() {
    console.log('Connecting to MySQL database...');
    
    let connection;
    try {
        // Try connecting directly to DB
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'attendance_system',
            multipleStatements: true
        });
    } catch (err) {
        // If database doesn't exist yet, connect without DB name and create it
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Database does not exist. Creating database...');
            const rootConn = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || ''
            });
            await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'attendance_system'}\`;`);
            await rootConn.end();

            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'attendance_system',
                multipleStatements: true
            });
        } else {
            throw err;
        }
    }

    try {
        console.log('Applying database schema (database.sql)...');
        const schemaSql = fs.readFileSync(path.join(__dirname, '../database.sql'), 'utf8');
        await connection.query(schemaSql);

        // Ensure profile_pic column exists on existing staff table
        try {
            await connection.query('ALTER TABLE staff ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL');
        } catch (e) {
            // Column may already exist
        }

        console.log('Applying seed data (seed.sql)...');
        const seedSql = fs.readFileSync(path.join(__dirname, '../seed.sql'), 'utf8');
        await connection.query(seedSql);

        console.log('Successfully seeded database!');
        console.log('--------------------------------------------------');
        console.log('Admin Account: admin@school.edu  | Password: admin123');
        console.log('Staff Account: john@example.com  | Password: password123');
        console.log('--------------------------------------------------');
    } catch (error) {
        console.error('Error seeding database:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

runSeed();
