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
    if (req.session.user) {
        const filePath = path.join(__dirname, '..', 'public', 'client_dashboard.html');
        res.sendFile(filePath, {}, function(err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200);
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/get-username', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Could not log out.');
      }
      res.redirect('/login');
    });
  });
  
// router.get('/client_dashboard', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public', 'client_dashboard.html'));
// });

module.exports = router;
