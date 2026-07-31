const db = require('../config/db');

exports.getChatPage = (req, res) => {
    res.render('admin/chat');
};

exports.processMessage = async (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    try {
        let response = { type: 'text', content: 'I am not sure how to help with that. Try asking "Who is late?" or "Show stats".' };

        // 1. Stats / Overview
        if (lowerMsg.includes('stats') || lowerMsg.includes('overview') || lowerMsg.includes('summary')) {
            const today = new Date().toISOString().split('T')[0];
            const [total] = await db.execute('SELECT COUNT(*) as c FROM staff WHERE status="Active"');
            const [present] = await db.execute('SELECT COUNT(*) as c FROM attendance WHERE date=? AND status="Present"', [today]);
            const [late] = await db.execute('SELECT COUNT(*) as c FROM attendance WHERE date=? AND status="Late"', [today]);

            response = {
                type: 'chart', // Changed from 'stats' to 'chart' for visual
                data: {
                    labels: ['Present', 'Late', 'Absent'],
                    values: [present[0].c, late[0].c, total[0].c - (present[0].c + late[0].c)],
                    total: total[0].c
                },
                content: 'Here is the attendance distribution for today.'
            };
        }

        // 2. Who is Late/Absent
        else if (lowerMsg.includes('late') || lowerMsg.includes('absent')) {
            const today = new Date().toISOString().split('T')[0];
            const status = lowerMsg.includes('late') ? 'Late' : 'Absent';

            let query = '';
            if (status === 'Late') {
                query = `SELECT s.name, a.check_in_time FROM attendance a JOIN staff s ON a.staff_id = s.staff_id WHERE a.date = ? AND a.status = 'Late'`;
            } else {
                // Absent logic is trickier without a cron job, but we can show who has NOT checked in
                // For simplicity, let's just query 'Absent' if we were marking them, or just show Late for now
                // Actually, let's just show LATE list as it's definitive.
            }

            if (status === 'Late') {
                const [rows] = await db.execute(query, [today]);
                if (rows.length > 0) {
                    response = {
                        type: 'list',
                        title: 'Staff Late Today',
                        items: rows.map(r => `${r.name} (${r.check_in_time.substring(0, 5)})`),
                        content: `Found ${rows.length} staff members who arrived late today.`
                    };
                } else {
                    response = { type: 'text', content: 'Good news! No one is late today.' };
                }
            } else {
                response = { type: 'text', content: 'Absent tracking is strictly calculated at EOD. For real-time "Not Checked In", try "stats".' };
            }
        }

        // 3. Staff List
        else if (lowerMsg.includes('staff') || lowerMsg.includes('list')) {
            const [rows] = await db.execute('SELECT name, department FROM staff WHERE status="Active" LIMIT 5');
            response = {
                type: 'list',
                title: 'Active Staff (Preview)',
                items: rows.map(r => `${r.name} - ${r.department}`),
                content: 'Here are the first 5 active staff members. Use the Staff Management page for full details.'
            };
        }

        // 4. Add Staff Helper
        else if (lowerMsg.includes('add') || lowerMsg.includes('new') || lowerMsg.includes('create')) {
            response = {
                type: 'action_link',
                text: 'Click here to add a new staff member',
                url: '/admin/add-staff',
                content: 'You can create a new staff account using the dedicated form.'
            };
        }

        res.json(response);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing your request' });
    }
};
