exports.isAuthenticated = (req, res, next) => {
    if (req.session.staffId) {
        return next();
    }
    req.session.info_msg = 'Please log in to access your staff portal.';
    res.redirect('/auth/login');
};

exports.isGuest = (req, res, next) => {
    if (req.session.staffId) {
        return res.redirect('/staff/dashboard');
    }
    next();
};
