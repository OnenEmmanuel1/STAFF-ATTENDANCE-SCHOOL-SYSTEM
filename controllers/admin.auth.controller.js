const bcrypt = require('bcrypt');
const path = require('path');
const Admin = require('../models/admin.model');

exports.getLoginPage = (req, res) => {
    res.render('admin/login');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findByEmail(email);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        req.session.adminId = admin.admin_id;
        req.session.adminName = admin.name;

        res.json({ success: true, redirect: '/admin/dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    delete req.session.adminId;
    delete req.session.adminName;
    req.session.success_msg = 'Logged out of Admin Portal successfully.';
    res.redirect('/admin/login');
};
