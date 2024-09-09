const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_wannapetz'
});

db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('MySQL connected as id ' + db.threadId);
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

const clientRoutes = [
    'client_dashboard',
    'client_adopt_a_pet',
    'client_adoption',
    'client_adopt_history',
    'client_monitoring',
    'client_scheduling',
    'client_spay_neuter'
];

clientRoutes.forEach(route => {
    router.get(`/${route}`, isAuthenticated, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', `${route}.html`));
    });
});

const adminRoutes = [
    'admin_dashboard',
    'admin_adopt_history',
    'admin_monitoring',
    'admin_scheduling',
    'admin_verification'
];

adminRoutes.forEach(route => {
    router.get(`/${route}`, isAuthenticated, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', `${route}.html`));
    });
});

router.get('/get-username', isAuthenticated, (req, res) => {
    res.json({ username: req.session.user.username });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login');
    });
});



module.exports = router;
