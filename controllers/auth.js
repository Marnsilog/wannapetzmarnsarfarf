const bcrypt = require('bcrypt');
const mysql = require('mysql');
require('dotenv').config({ path: './.env' });
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const moment = require('moment');
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

exports.addPet = (req, res) => {
    const formFile = req.files?.formFile;
    const adopt_status = "spayneuter";
    const datetime = moment().format('YYYY-MM-DD HH:mm:ss'); 

    if (!formFile) {
        return res.status(400).send("No file uploaded.");
    }

    const {
        pet_name, location, age, gender, owner, breed,
        contact_number, pet_type, email, color, birthday
    } = req.body;
    const username = req.session.user?.username;

    if (!username) {
        return res.status(401).send('User not logged in.');
    }

    // Use formFile.name instead of formFile.filename
    const uploadPath1 = path.join('savedpic', formFile.name);

    formFile.mv(uploadPath1, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert file information into tbl_petinformation
        const sqlInsertFile1 = `
            INSERT INTO tbl_petinformation (
            added_by, pet_name, location, age, gender, owner,
            breed, contact_number, pet_type, email, color, birthday, adopt_status, datetime, image_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlInsertFile1, [username, pet_name, location, age, gender, owner,
            breed, contact_number, pet_type, email, color, birthday, adopt_status, datetime, uploadPath1], (error, results) => {
            if (error) {
                console.error('Error inserting file data:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/client_dashboard');
        });
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

exports.adoptPet = (req, res) => {
    const pet_id = req.body.pet_id;
    const formFile = req.files?.formFile;

    if (!formFile) {
        return res.status(400).send("No file uploaded.");
    }

    const uploadPath = path.join(__dirname, '../savedpic', formFile.name);

    // Save the uploaded file
    formFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert file information into tbl_adoptionfiles
        const sqlInsertFile = `
            INSERT INTO tbl_adoptionfiles (pet_id, submitted_file) 
            VALUES (?, ?)
        `;
        db.query(sqlInsertFile, [pet_id, uploadPath], (error, results) => {
            if (error) {
                console.error('Error inserting file data:', error);
                return res.status(500).send('Internal Server Error');
            }

            // Get current datetime
            const now = moment().format('YYYY-MM-DD HH:mm:ss'); 

            // Update tbl_petinformation
            const sqlUpdatePet = `
                UPDATE tbl_petinformation 
                SET status = 'pending', adopt_status = 'adoption', datetime = ? 
                WHERE pet_id = ?
            `;
            db.query(sqlUpdatePet, [now, pet_id], (error, results) => {
                if (error) {
                    console.error('Error updating pet information:', error);
                    return res.status(500).send('Internal Server Error');
                }
            });
        });
    });
};

exports.getPendingPets = (req, res) => {
    const query = 'SELECT * FROM tbl_petinformation WHERE status = "pending"';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching pets:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};

exports.updatePetStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const datetime = new Date();

    const query = 'UPDATE tbl_petinformation SET status = ?, datetime = ? WHERE pet_id = ?';
    db.query(query, [status, datetime, id], (error, results) => {
        if (error) {
            console.error('Error updating status:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.sendStatus(200);
    });
};

exports.getAllPets = (req, res) => {
    const petType = req.query.type;
    let query = 'SELECT * FROM tbl_petinformation';
    const queryParams = [];

    if (petType) {
        query += ' WHERE pet_type = ?';
        queryParams.push(petType);
    }

    // Add ORDER BY clause to sort by datetime (most recent first)
    query += ' ORDER BY datetime DESC';

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error fetching pet data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};


exports.getAllapprovepets = (req, res) => {
    const petType = req.query.type;
    let query = 'SELECT * FROM tbl_petinformation WHERE status = "approved" AND adopt_status = "spayneuter"';
    const queryParams = [];

    if (petType) {
        query += ' AND pet_type = ?';
        queryParams.push(petType);
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error fetching pet data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};

//clientHistory
exports.getAllclientpets = (req, res) => {
    const username = req.session.user.username;
    let query = 'SELECT * FROM tbl_petinformation WHERE added_by = ?';

    db.query(query, [username], (error, results) => {
        if (error) {
            console.error('Error fetching pet data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};

//client monitoring
exports.monitoring = (req, res) => {
    const pet_id = req.body.pet_id;
    const formFile = req.files?.formFile;
  
    if (!formFile) {
        return res.status(400).send("No file uploaded.");
    }

    const uploadPath = path.join(__dirname, '../savedvideo', formFile.name);

    // Save the uploaded file
    formFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert file information into tbl_adoptionfiles
        
        // Get current datetime
        const now = moment().format('YYYY-MM-DD'); 

        // Update tbl_petinformation
        const sqlUpdatePet = `
            UPDATE tbl_adoptionfiles SET date = ?, video_path =? 
            WHERE pet_id = ?
        `;
        db.query(sqlUpdatePet, [now, uploadPath, pet_id], (error, results) => {
            if (error) {
                console.error('Error updating pet information:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.send('File uploaded and pet information updated successfully.');
        });
    });
};

// exports.getAlladoptionapprovepets = (req, res) => {
   
//     const query = 'SELECT * FROM tbl_petinformation WHERE status = "approved" AND adopt_status = "adoption"';
//     db.query(query, (error, results) => {
//         if (error) {
//             console.error('Error fetching pet data:', error);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.json(results);
//     });
// };

exports.getAlladoptionapprovepets = (req, res) => {
    const query = `
        SELECT pi.pet_id, pi.pet_type, pi.pet_name, pi.status, pi.image_path, pi.adopt_status, uf.video_path, uf.date AS video_date
        FROM tbl_petinformation pi
        LEFT JOIN tbl_adoptionfiles uf ON pi.pet_id = uf.pet_id
        WHERE pi.status = 'approved' AND pi.adopt_status = 'adoption'
    `;
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching pet data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};

