const bcrypt = require('bcrypt');
const path = require('path');
const Staff = require('../models/staff.model');

exports.getLoginPage = (req, res) => {
    res.render('login');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}, Password: ${password}`);

    try {
        const staff = await Staff.findByEmail(email);
        console.log('[LOGIN DEBUG] Staff found:', staff);

        if (!staff) {
            console.log('[LOGIN FAILED] User not found');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, staff.password);
        console.log(`[LOGIN DEBUG] Password match result: ${isMatch}`);

        if (!isMatch) {
            console.log('[LOGIN FAILED] Password mismatch');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (staff.status !== 'Active') {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        req.session.staffId = staff.staff_id;
        req.session.staffName = staff.name;

        console.log('[LOGIN SUCCESS] Session created');
        res.json({ success: true, redirect: '/staff/dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.redirect('/auth/login');
    });
};
