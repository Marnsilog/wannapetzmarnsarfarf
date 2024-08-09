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

// Fetch all pets with status "pending"
// router.get('/api/pets', (req, res) => {
//     const query = 'SELECT * FROM tbl_petinformation WHERE status = "pending"';
//     db.query(query, (error, results) => {
//         if (error) {
//             console.error('Error fetching pets:', error);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.json(results);
//     });
// });

// // Update pet status and datetime
// //spay and neuter
// router.put('/api/pets/:id/status', (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const datetime = new Date();

//     const query = 'UPDATE tbl_petinformation SET status = ?, datetime = ? WHERE pet_id = ?';
//     db.query(query, [status, datetime, id], (error, results) => {
//         if (error) {
//             console.error('Error updating status:', error);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.sendStatus(200);
//     });
// });


// // Fetch all pets
// // Fetch all pets or filter by type
// router.get('/api/allpets', (req, res) => {
//     const petType = req.query.type;
//     let query = 'SELECT * FROM tbl_petinformation';
//     const queryParams = [];

//     db.query(query, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error fetching pet data:', error);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.json(results);
//     });
// });

//adopt_a_pet
// router.get('/api/allapprovedpets', (req, res) => {
//     const petType = req.query.type;
//     let query = 'SELECT * FROM tbl_petinformation WHERE status = "approved" AND adopt_status = "spayneuter"';
//     const queryParams = [];

//     if (petType) {
//         query += ' AND pet_type = ?';
//         queryParams.push(petType);
//     }

//     db.query(query, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error fetching pet data:', error);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.json(results);
//     });
// });



// //clientHistory
// router.get('/api/allclientpets', (req, res) => {
//     const username = req.session.user.username;
//     let query = 'SELECT * FROM tbl_petinformation WHERE added_by = ?';

//     db.query(query, [username], (error, results) => {
//         if (error) {
//             console.error('Error fetching pet data:', error);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.json(results);
//     });
// });

module.exports = router;
