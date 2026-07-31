exports.isAuthenticated = (req, res, next) => {
    if (req.session.staffId) {
        return next();
    }
    res.redirect('/auth/login');
};

exports.isGuest = (req, res, next) => {
    if (req.session.staffId) {
        return res.redirect('/staff/dashboard');
    }
    next();
};
