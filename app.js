const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For password hashing
require('dotenv').config({ path: './.env' });

const app = express();

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbwannapetz'
});

db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('MySQL connected as id ' + db.threadId);
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'hbs');

// Serve the form page
app.get('/', (req, res) => {
    res.render('index');
});

// Hash a password
async function hashPassword(password) {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

// Compare a password with a stored hash
async function comparePassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw error;
    }
}

//SIGNUP
app.post('/signup', async (req, res) => {
    const { username, password, firstname, lastname, address, contactnum, selection } = req.body;

    const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{12,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).send('Password must be at least 12 characters long, contain at least one number and one uppercase letter.');
    }

    try {
        const hashedPassword = await hashPassword(password);
        const sql = `
            INSERT INTO tbl_users (username, password, name, lastname, location, contactnumber, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            username,
            hashedPassword,
            firstname,
            lastname,
            address,
            contactnum,
            selection
        ];

        db.query(sql, values, (error, results) => {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).send('Error inserting data');
            }
            res.send('Registration successful');
        });
    } catch (err) {
        console.error('Error processing password:', err);
        res.status(500).send('Error processing password');
    }
});


//LOGIN
async function comparePassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw error;
    }
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = 'SELECT * FROM tbl_users WHERE username = ?';
        db.query(sql, [username], async (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                return res.redirect('/login?error=Error fetching user');
            }

            if (results.length === 0) {
                return res.redirect('/login?error=Invalid username or password');
            }

            const user = results[0];
            const isMatch = await comparePassword(password, user.password);

            if (isMatch) {
                return res.redirect('/client_dashboard.html?success=Login successful');
            } else {
                return res.redirect('/login?error=Invalid username or password');
            }
        });
    } catch (err) {
        console.error('Error processing login:', err);
        res.redirect('/login?error=Error processing login');
    }
});



// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
