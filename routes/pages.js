const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

router.get('/client_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_dashboard.html'));
});

module.exports = router;
