const bcrypt = require('bcryptjs');
const mysql = require('mysql');
require('dotenv').config({ path: './.env' });
const path = require('path');
const moment = require('moment');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    //port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
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
        const { username, password, confirmpassword, firstname, lastname, address, contactnum, selection, email } = req.body;
        
        // Check if all required fields are filled
        if (!username || !password || !confirmpassword || !firstname || !lastname || !address || !contactnum || !selection || !email) {
            return res.status(400).send("All fields are required.");
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            return res.status(400).send("Passwords do not match.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user data including email into the database
        const query = 'INSERT INTO tbl_users (username, password, name, lastname, location, contactnumber, gender, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [username, hashedPassword, firstname, lastname, address, contactnum, selection, email], (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username or email already taken.');
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
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/login');
    });
};
//addspay
exports.addSpayneuter = (req, res) => {
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
            breed, contact_number, pet_type, email, color, birthday, status, adopt_status, datetime, image_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
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
//for adoption
exports.addAdoption = (req, res) => {
    const formFile = req.files?.formFile;
    const adopt_status = "for adoption";
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
            return res.status(200).send('Adoption request submitted successfully!');
        });
    });
};

//adopt a pet
exports.adoptPet = (req, res) => {
    const pet_id = req.body.pet_id;
    const formFile = req.files?.formFile;
    
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const username = req.session.user.username;
    
    if (!formFile) {
        return res.status(400).json({ error: "No file uploaded." });
    }
    const uniqueFileName = `${Date.now()}-${formFile.name}`;
    const uploadPath = path.join(__dirname, '../savedfile', uniqueFileName);
    formFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const relativePath = `savedfile/${uniqueFileName}`;
        const sqlInsertFile = `
            INSERT INTO tbl_adoptionfiles (pet_id, submitted_file) 
            VALUES (?, ?)
        `;
        db.query(sqlInsertFile, [pet_id, relativePath], (error, results) => {
            if (error) {
                console.error('Error inserting file data:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            const sqlUpdatePet = `
                UPDATE tbl_petinformation 
                SET status = 'pending', adopt_status = 'adoption', datetime = ?, adoptor_name = ?
                WHERE pet_id = ?
            `;
            db.query(sqlUpdatePet, [now, username, pet_id], (error, results) => {
                if (error) {
                    console.error('Error updating pet information:', error);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.redirect('/client_adopt_a_pet');
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
    const { status, datetime } = req.body;

    const query = 'UPDATE tbl_petinformation SET status = ?, datetime = ? WHERE pet_id = ?';
    db.query(query, [status, datetime || new Date(), id], (error, results) => {
        if (error) {
            console.error('Error updating status:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.sendStatus(200);
    });
};
//VIEW USER
exports.getalluser = (req, res) => {
    const query = 'SELECT * FROM tbl_users';
    const queryParams = [];

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};
//Count
exports.getCount = (req, res) => {
    const queries = {
        spayNeuterCount: "SELECT COUNT(*) AS count FROM tbl_petinformation WHERE adopt_status = 'spayneuter'",
        adoptionCount: "SELECT COUNT(*) AS count FROM tbl_petinformation WHERE adopt_status = 'adoption'",
        forAdoptionCount: "SELECT COUNT(*) AS count FROM tbl_petinformation WHERE adopt_status = 'for adoption'",
        overallCount: "SELECT COUNT(*) AS count FROM tbl_petinformation"
    };

    const results = {};
    let completedQueries = 0;

    for (const [key, query] of Object.entries(queries)) {
        db.query(query, (error, rows) => {
            if (error) {
                return res.status(500).json({ error: 'Database query failed' });
            }
            results[key] = rows[0].count; // Use `rows` instead of `results` to avoid confusion
            completedQueries++;
            if (completedQueries === Object.keys(queries).length) {
                res.json(results);
            }
        });
    }
};
//ADMIN HISTORY
exports.getpetHistory = (req, res) => {
    const petType = req.query.type;
    let query = 'SELECT * FROM tbl_petinformation ORDER BY datetime DESC';
    const queryParams = [];


    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error fetching pet data:', error);
            return res.status(500).send('Internal Server Error');
        }
        //console.log(results);
        res.json(results);
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
        //console.log(results);
        res.json(results);
    });
};
exports.getAllapprovepets = (req, res) => {
    const petType = req.query.type;
    let query = 'SELECT * FROM tbl_petinformation WHERE adopt_status = "for adoption"';
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
    let query = 'SELECT * FROM tbl_petinformation WHERE added_by = ? OR adoptor_name = ?';

    db.query(query, [username, username], (error, results) => {
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

//schedule
exports.getclientSched = (req, res) => {
    const addedBy = req.session.user.username; 
  
    const sql = `
      SELECT datetime FROM tbl_petinformation WHERE adopt_status = 'spayneuter' 
        AND status = 'approved' AND added_by = ?`;
    
    //console.log('Running SQL:', sql, 'with addedBy:', addedBy); // Log SQL query
  
    db.query(sql, [addedBy], (error, results) => {
      if (error) {
        console.error('Database error:', error); // Log the error
        return res.status(500).json({ error: 'Database error' });
      }
      //console.log('Scheduled dates:', results); // Log results for debugging
      res.json(results);
    });
  };
  
  exports.getadminSched = (req, res) => {
    const sql = `
      SELECT * FROM tbl_petinformation 
      WHERE adopt_status = 'spayneuter' AND status = 'approved'`;
  
    db.query(sql, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results); // Send the data back to the client
    });
  };
  
  exports.sendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user exists
        const user = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
        if (!user || user.length === 0) {
            return res.status(400).json({ message: 'No account with that email found.' });
        }

        // Generate reset token and expiration time
        const token = crypto.randomBytes(20).toString('hex');
        const expireTime = Date.now() + 3600000; // Token valid for 1 hour

        // Update the user's record with the reset token and expiration
        await db.query('UPDATE tbl_users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [token, expireTime, email]);

        // Create the reset link
        const resetLink = `http://${req.headers.host}/auth/reset-password/${token}`;

        // Configure the email transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        // Define email options
        const mailOptions = {
            to: email,
            from: process.env.EMAIL, // Ensure this is set in your environment variables
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) requested the reset of your account's password.\n\n` +
                  `Please click the following link, or copy and paste it into your browser to complete the process:\n\n` +
                  `${resetLink}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Return success response
        res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

//   exports.sendEmail = async (req, res) => {
//     try {
//       const { email } = req.body;
//       //console.log("Received email:", email);
//       const user = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
      
//       if (!user || user.length === 0) {
//         return res.status(400).json({ message: 'No account with that email found.' });
//       }
  
//       const token = crypto.randomBytes(20).toString('hex');
//       const expireTime = Date.now() + 3600000; 
//       await db.query('UPDATE tbl_users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [token, expireTime, email]);
//       const resetLink = `http://${req.headers.host}/auth/reset-password/${token}`;
//       const transporter = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: process.env.EMAIL, // Use environment variables for sensitive info
//           pass: process.env.PASSWORD,
//         },
//       });
  
//       // Define the email options
//       const mailOptions = {
//         to: email,
//         from: 'renzolimpiya@gmail.com',
//         subject: 'Password Reset',
//         text: `You are receiving this because you (or someone else) requested the reset of your account's password.\n\n
//                Please click the following link, or copy and paste it into your browser to complete the process:\n\n
//                ${resetLink}\n\n
//                If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//       };
  
//       // Send the email
//       await transporter.sendMail(mailOptions);
      
//       // Return success response
//       res.status(200).json({ message: 'Reset link sent to your email.' });
//     } catch (err) {
//       console.error('Error sending email:', err);
//       res.status(500).json({ message: 'Internal server error.' });
//     }
//   };
  

  exports.renderResetPasswordPage = (req, res) => {
    const token = req.params.token;
    console.log("Received token:", token); 
    res.sendFile(path.join(__dirname, '..', 'public', 'reset_pass.html'), {
        headers: {
            'token': token 
        }
    });
};

const util = require('util');
const query = util.promisify(db.query).bind(db);
exports.resetPassword = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { token, password } = req.body;
        console.log("Received token from request:", token);
    
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required.' });
        }

        const sql = 'SELECT * FROM tbl_users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?';
        console.log("Executing SQL:", sql, "with parameters :", [token, Date.now()]);

        const result = await query(sql, [token, Date.now()]);
        console.log("Query Result:", result); // Log the result
  
        // Check if the result is structured as expected
        if (!Array.isArray(result) || result.length === 0) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }
  
        const user = result[0];
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        await query(
            'UPDATE tbl_users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE user_id = ?',
            [hashedPassword, user.user_id]
        );
    
        res.status(200).json({ message: 'Your password has been updated. You can now log in.', redirectTo: '/login' });
    } catch (error) {
        console.error('Error resetting password:', error.message || error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
  
  
  