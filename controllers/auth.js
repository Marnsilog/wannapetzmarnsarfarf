const bcrypt = require('bcrypt');
const mysql = require('mysql');
require('dotenv').config({ path: './.env' });
const path = require('path');
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
        if (!username || !password || !confirmpassword || !firstname || !lastname || !address || !contactnum || !selection) {
            return res.status(400).send("All fields are required.");
        }

        if (password !== confirmpassword) {
            return res.status(400).send("Passwords do not match.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO tbl_users (username, password, name, lastname, location, contactnumber, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [username, hashedPassword, firstname, lastname, address, contactnum, selection], (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username already taken.');
                }
                console.error('Error inserting data:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).json({ message: 'Submitted successfully!' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Internal Server Error");
    }
};

exports.submitAssessment = async (req, res) => {
    try {
        const { name, address, age, nationality, cpnum, email, occupation, q1, q2, q3, q4 } = req.body;

        // Validate fields
        if (!name || !address || !age || !nationality || !cpnum || !email || !occupation || !q1 || !q2 || !q3 || !q4) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const query = 'INSERT INTO tbl_applicantinfo (name, address, age, nationality, phonenumber, email, occupation, q1, q2, q3, q4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, address, age, nationality, cpnum, email, occupation, q1, q2, q3, q4], (error, results) => {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            res.status(200).json({ message: 'Submitted successfully!' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getUserProfilepic = (req, res) => {
    const username = req.session.user?.username;

    if (!username) {
        return res.status(400).json({ success: false, message: "User not logged in." });
    }

    const query = 'SELECT profile_pic FROM tbl_users WHERE username = ?';
    db.query(query, [username], (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        const profilePicPath = results[0]?.profile_pic || 'img/user.png';
        res.json({ success: true, profilePicPath });
    });
};

exports.getUserProfile = async (req, res) => {
    try {
        const username = req.session.user?.username;

        if (!username) {
            return res.status(400).send("User not logged in.");
        }

        const query = 'SELECT name, lastname, location AS address, contactnumber, gender, profile_pic FROM tbl_users WHERE username = ?';
        db.query(query, [username], (error, results) => {
            if (error) {
                console.error('Error fetching user data:', error);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length > 0) {
                const userData = results[0];
                userData.profile_img = userData.profile_img || 'img/user.png'; 
                res.json(userData); 
            } else {
                res.status(404).send("User not found.");
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Internal Server Error");
    }
};
exports.updateUserProfile = (req, res) => {
    const username = req.session.user?.username;

    if (!username) {
        return res.status(400).send({ success: false, message: "User not logged in." });
    }

    const { firstName, lastName, address, contactNumber, gender } = req.body;
    let profilePicturePath = null;

    if (req.files && req.files.profilePicture) {
        const profilePicture = req.files.profilePicture;
        const uniqueFileName = `${username}_${Date.now()}_${profilePicture.name}`;
        const uploadPath = path.join(__dirname, '../savedprofilepic', uniqueFileName);

        profilePicture.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error moving file:', err);
                return res.status(500).send({ success: false, message: 'Internal Server Error' });
            }

            profilePicturePath = `savedprofilepic/${uniqueFileName}`;

            // Continue with the rest of the update after the file has been moved
            updateUserDetails();
        });
    } else {
        updateUserDetails();
    }

    function updateUserDetails() {
        const query = `
            UPDATE tbl_users
            SET name = ?, lastname = ?, location = ?, contactnumber = ?, gender = ?
            ${profilePicturePath ? `, profile_pic = ?` : ''}
            WHERE username = ?
        `;

        const queryParams = profilePicturePath
            ? [firstName, lastName, address, contactNumber, gender, profilePicturePath, username]
            : [firstName, lastName, address, contactNumber, gender, username];

        db.query(query, queryParams, (error, results) => {
            if (error) {
                console.error('Error updating user data:', error);
                return res.status(500).send({ success: false, message: 'Internal Server Error' });
            }

            res.send({ success: true, message: 'Profile updated successfully.' });
        });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = 'SELECT * FROM tbl_users WHERE username = ?';
        db.query(sql, [username], async (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                req.session.user = { username };
                let redirectUrl = '/client_dashboard';

                if (user.user_permission === 'admin') {
                    redirectUrl = '/admin_dashboard';
                } 

                res.status(200).json({ message: 'Login successful!', redirectUrl });
            } else {
                res.status(401).json({ message: 'Invalid username or password' });
            }
        });
    } catch (err) {
        console.error('Error processing login:', err);
        res.status(500).json({ message: 'Error processing login' });
    }
};

// exports.login = async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const sql = 'SELECT * FROM tbl_users WHERE username = ?';
//         db.query(sql, [username], async (error, results) => {
//             if (error) {
//                 console.error('Error fetching user:', error);
//                 return res.status(500).send('Internal Server Error');
//             }

//             if (results.length === 0) {
//                 return res.status(401).send('Invalid username or password');
//             }

//             const user = results[0];
//             const isMatch = await bcrypt.compare(password, user.password);

//             if (isMatch) {
//                 req.session.user = { username };
//                 if (user.user_permission === "user") {
//                     res.redirect('/client_dashboard');
//                 } else if (user.user_permission === "admin") {
//                     res.redirect('/admin_dashboard');
//                 } else {
//                     res.status(403).send('Forbidden: Unknown user permission');
//                 }
//             } else {
//                 res.status(401).send('Invalid username or password');
//             }
//         });
//     } catch (err) {
//         console.error('Error processing login:', err);
//         res.status(500).send('Error processing login');
//     }
// };

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/login');
    });
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
exports.addAdopt = (req, res) => {
    const formFile = req.files?.formFile;
    const adopt_status = "spayneuter";
    const status = "approved"
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
            breed, contact_number, pet_type, email, color, birthday, adopt_status, status, datetime, image_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlInsertFile1, [username, pet_name, location, age, gender, owner,
            breed, contact_number, pet_type, email, color, birthday, adopt_status, status, datetime, uploadPath1], (error, results) => {
            if (error) {
                console.error('Error inserting file data:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/admin_dashboard');
        });
    });
};
//adopt a pet
exports.adoptPet = (req, res) => {
    const pet_id = req.body.pet_id;
    const formFile = req.files?.formFile;
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).send('Unauthorized');
    }

    const username = req.session.user.username;
    if (!formFile) {
        return res.status(400).send("No file uploaded.");
    }

    const uniqueFileName = `${Date.now()}-${formFile.name}`;
    const uploadPath = path.join(__dirname, '../savedfile', uniqueFileName);
    formFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send('Internal Server Error');
        }

        const relativePath = `savedfile/${uniqueFileName}`;

        const sqlInsertFile = `
            INSERT INTO tbl_adoptionfiles (pet_id, submitted_file) 
            VALUES (?, ?)
        `;
        db.query(sqlInsertFile, [pet_id, relativePath], (error, results) => {
            if (error) {
                console.error('Error inserting file data:', error);
                return res.status(500).send('Internal Server Error');
            }

            // Get current datetime
            const now = moment().format('YYYY-MM-DD HH:mm:ss');

            // Update tbl_petinformation
            const sqlUpdatePet = `
                UPDATE tbl_petinformation 
                SET status = 'pending', adopt_status = 'adoption', datetime = ?, adoptor_name = ?
                WHERE pet_id = ?
            `;
            db.query(sqlUpdatePet, [now, username, pet_id], (error, results) => {
                if (error) {
                    console.error('Error updating pet information:', error);
                    return res.status(500).send('Internal Server Error');
                }

                // Success
                res.status(200).send('Pet adoption request submitted successfully.');
            });
        });
    });
};
// exports.adoptPet = (req, res) => {
//     const pet_id = req.body.pet_id;
//     const formFile = req.files?.formFile;
//     if (!req.session.user || !req.session.user.username) {
//         return res.status(401).send('Unauthorized');
//     }

//     const username = req.session.user.username;
//     if (!formFile) {
//         return res.status(400).send("No file uploaded.");
//     }

//     const uploadPath = path.join(__dirname, '../savedfile', formFile.name);

//     // Save the uploaded file
//     formFile.mv(uploadPath, (err) => {
//         if (err) {
//             console.error('Error moving file:', err);
//             return res.status(500).send('Internal Server Error');
//         }

//         // Insert file information into tbl_adoptionfiles
//         const sqlInsertFile = `
//             INSERT INTO tbl_adoptionfiles (pet_id, submitted_file) 
//             VALUES (?, ?)
//         `;
//         db.query(sqlInsertFile, [pet_id, uploadPath], (error, results) => {
//             if (error) {
//                 console.error('Error inserting file data:', error);
//                 return res.status(500).send('Internal Server Error');
//             }

//             // Get current datetime
//             const now = moment().format('YYYY-MM-DD HH:mm:ss'); 

//             // Update tbl_petinformation
//             const sqlUpdatePet = `
//                 UPDATE tbl_petinformation 
//                 SET status = 'pending', adopt_status = 'adoption', datetime = ?, adoptor_name = ?
//                 WHERE pet_id = ?
//             `;
//             db.query(sqlUpdatePet, [now, username, pet_id], (error, results) => { // Fixed the parameter array
//                 if (error) {
//                     console.error('Error updating pet information:', error);
//                     return res.status(500).send('Internal Server Error');
//                 }

//                 // Success
//                 res.status(200).send('Pet adoption request submitted successfully.');
//             });
//         });
//     });
// };

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

    // Generate a unique file name to avoid conflicts
    const uniqueFileName = `${Date.now()}-${formFile.name}`;
    const uploadPath = path.join(__dirname, '../savedvideo', uniqueFileName);

    // Save the uploaded file
    formFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).send('Internal Server Error');
        }

        const now = moment().format('YYYY-MM-DD');

        // Save the relative path or file name instead of the full path
        const relativePath = `savedvideo/${uniqueFileName}`;

        const sqlUpdatePet = `
            UPDATE tbl_adoptionfiles SET date = ?, video_path =? 
            WHERE pet_id = ?
        `;
        db.query(sqlUpdatePet, [now, relativePath, pet_id], (error, results) => {
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
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).send('Unauthorized');
    }

    const username = req.session.user.username;
    const query = `
        SELECT pi.pet_id, pi.pet_type, pi.pet_name, pi.status, pi.image_path, pi.adopt_status, uf.video_path, uf.date AS video_date
        FROM tbl_petinformation pi
        LEFT JOIN tbl_adoptionfiles uf ON pi.pet_id = uf.pet_id
        WHERE pi.status = 'approved' AND pi.adopt_status = 'adoption' AND pi.adoptor_name = ?
    `;

    db.query(query, [username], (error, results) => {
        if (error) {
            console.error('Error fetching pet data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};

exports.getAlladminadoptpets  = (req, res) => {
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
