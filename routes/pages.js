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


//USER
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

router.get('/client_adopt_a_pet', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_adopt_a_pet.html'));
});
router.get('/client_adopt_history', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_adopt_history.html'));
});

router.get('/client_monitoring', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_monitoring.html'));
});

router.get('/client_scheduling', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_scheduling.html'));
});

router.get('/client_spay_neuter', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'client_spay_neuter.html'));
});


//ADMIN
router.get('/admin_dashboard', (req, res) => {
    if (req.session.user) {
        const filePath = path.join(__dirname, '..', 'public', 'admin_dashboard.html');
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
router.get('/admin_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_dashboard.html'));
});
router.get('/admin_adopt_history', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_adopt_history.html'));
});
router.get('/admin_monitoring', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_monitoring.html'));
});
router.get('/admin_scheduling', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_scheduling.html'));
});
router.get('/admin_verification', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin_verification.html'));
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
