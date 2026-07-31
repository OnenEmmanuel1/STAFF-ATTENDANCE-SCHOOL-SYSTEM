exports.isAdminAuthenticated = (req, res, next) => {
    if (req.session.adminId) {
        return next();
    }
    res.redirect('/admin/login');
};

exports.isAdminGuest = (req, res, next) => {
    if (req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    next();
};
