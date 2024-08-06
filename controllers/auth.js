const bcrypt = require('bcrypt');
const mysql = require('mysql');
require('dotenv').config({ path: './.env' });
const path = require('path');
const fs = require('fs');
// Database connection
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
        const query = 'INSERT INTO tbl_users (username, password, name, lastname, location, contactnumber, gender, user_permission) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [username, hashedPassword, firstname, lastname, address, contactnum, selection, "user"], (error, results) => {
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

exports.addPet = (req, res) => {
    const {
        pet_name, location, age, gender, owner, breed,
        contact_number, pet_type, email, color, birthday
    } = req.body;
    const username = req.session.user?.username;

    if (!username) {
        return res.status(401).send('User not logged in.');
    }

    if (!pet_name || !location || !age || !gender || !owner || !breed || !contact_number || !pet_type || !email || !color || !birthday) {
        return res.status(400).send("All fields are required.");
    }

    const pet_image = req.files?.pet_image;
    const status = "pending";
    const adopt_status = "spayneuter";
    const datetime = new Date(); // Get the current date and time

    const query = `
        INSERT INTO tbl_petinformation (
            added_by, pet_name, location, age, gender, owner,
            breed, contact_number, pet_type, email, color, birthday, adopt_status, status, datetime, pet_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let pet_image_buffer = null;
    if (pet_image) {
        pet_image_buffer = pet_image.data; 
    }

    db.query(query, [
        username, pet_name, location, age, gender, owner,
        breed, contact_number, pet_type, email, color, birthday, adopt_status, status, datetime, pet_image_buffer
    ], (error, results) => {
        if (error) {
            console.error('Error inserting data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/client_spay_neuter');
    });
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
                req.session.user = { username };
                if (user.user_permission === "user") {
                    res.redirect('/client_dashboard');
                } else if (user.user_permission === "admin") {
                    res.redirect('/admin_dashboard');
                } else {
                    res.status(403).send('Forbidden: Unknown user permission');
                }
            } else {
                res.status(401).send('Invalid username or password');
            }
        });
    } catch (err) {
        console.error('Error processing login:', err);
        res.status(500).send('Error processing login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/login');
    });
};
