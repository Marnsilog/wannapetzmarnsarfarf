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

// Client Routes
router.get('/client_dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_dashboard.html'));
});

router.get('/client_adopt_a_pet', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_adopt_a_pet.html'));
});

router.get('/client_adoption', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_adoption.html'));
});

router.get('/client_adopt_history', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_adopt_history.html'));
});

router.get('/client_monitoring', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_monitoring.html'));
});

router.get('/client_scheduling', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_scheduling.html'));
});

router.get('/client_spay_neuter', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_spay_neuter.html'));
});

// Admin Routes
router.get('/admin_dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_dashboard.html'));
});

router.get('/admin_adopt_history', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_adopt_history.html'));
});

router.get('/admin_monitoring', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_monitoring.html'));
});

router.get('/admin_scheduling', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_scheduling.html'));
});

router.get('/admin_addpet', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_addpet.html'));
});

router.get('/admin_verification', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_verification.html'));
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
