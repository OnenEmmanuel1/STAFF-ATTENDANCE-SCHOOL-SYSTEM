exports.isAdminAuthenticated = (req, res, next) => {
    if (req.session.adminId) {
        return next();
    }
    req.session.info_msg = 'Please log in to access the Admin Console.';
    res.redirect('/admin/login');
};

exports.isAdminGuest = (req, res, next) => {
    if (req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    next();
};
