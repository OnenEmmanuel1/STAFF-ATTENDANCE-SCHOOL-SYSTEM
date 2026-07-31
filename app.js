const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// CSRF Protection
app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });
// Apply CSRF only to non-API routes or handle API CSRF carefully.
// For simplicity in this review, we'll apply it globally and exclude API if needed.
app.use((req, res, next) => {
    // Exclude API routes from CSRF if they use token-based auth
    // But since this app uses sessions for everything, keep it.
    csrfProtection(req, res, next);
});

// Provide CSRF token to all EJS templates
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/auth', authRoutes);
app.use('/staff', staffRoutes);
app.use('/admin', adminRoutes);

// Default Route
app.get('/', (req, res) => {
    if (req.session.staffId) {
        res.redirect('/staff/dashboard');
    } else {
        res.render('login');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
