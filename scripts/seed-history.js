const db = require('../config/db');

async function seedHistory() {
    try {
        console.log('Seeding attendance history...');

        // Get the first active staff member
        const [staffRows] = await db.execute('SELECT staff_id FROM staff LIMIT 1');
        if (staffRows.length === 0) {
            console.log('No staff found. Please seed staff first.');
            process.exit(1);
        }
        const staffId = staffRows[0].staff_id;
        console.log(`Seeding data for Staff ID: ${staffId}`);

        // Generate 30 days of data
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Skip weekends (0 = Sun, 6 = Sat)
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            // Randomize status
            const rand = Math.random();
            let status = 'Present';
            let checkIn = '08:55:00';
            let checkOut = '17:05:00';

            if (rand > 0.8) {
                status = 'Late';
                checkIn = '09:30:00';
            } else if (rand > 0.95) {
                status = 'Absent';
                checkIn = null;
                checkOut = null;
            }

            if (status !== 'Absent') {
                await db.execute(
                    'INSERT IGNORE INTO attendance (staff_id, date, check_in_time, check_out_time, status, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
                    [staffId, dateStr, checkIn, checkOut, status, '127.0.0.1']
                );
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedHistory();
