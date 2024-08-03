const bcrypt = require('bcrypt');
const mysql = require('mysql');
require('dotenv').config({ path: './.env' });

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

exports.signup = async (req, res) => {
    try {
        const { username, password, confirmpassword, firstname, lastname, address, contactnum, selection } = req.body;

        // Validate fields
        if (!username || !password || !confirmpassword || !firstname || !lastname || !address || !contactnum || !selection) {
            return res.status(400).send("All fields are required.");
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            return res.status(400).send("Passwords do not match.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const query = 'INSERT INTO tbl_users (username, password, name, lastname, location, contactnumber, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [username, hashedPassword, firstname, lastname, address, contactnum, selection], (error, results) => {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).send('Internal Server Error');
            }
            // Redirect to login page
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Internal Server Error");
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = 'SELECT * FROM tbl_users WHERE username = ?';
        db.query(sql, [username], async (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length === 0) {
                return res.status(401).send('Invalid username or password');
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                return res.redirect('/client_dashboard');
            } else {
                return res.status(401).send('Invalid username or password');
            }
        });
    } catch (err) {
        console.error('Error processing login:', err);
        res.status(500).send('Error processing login');
    }
};
