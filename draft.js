//SIGNUP
// app.post('/signup', async (req, res) => {
//     const { username, password, firstname, lastname, address, contactnum, selection } = req.body;

//     const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{12,}$/;
//     if (!passwordRegex.test(password)) {
//         return res.status(400).send('Password must be at least 12 characters long, contain at least one number and one uppercase letter.');
//     }

//     try {
//         const hashedPassword = await hashPassword(password);
//         const sql = `
//             INSERT INTO tbl_users (username, password, name, lastname, location, contactnumber, gender)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//         `;
        
//         const values = [
//             username,
//             hashedPassword,
//             firstname,
//             lastname,
//             address,
//             contactnum,
//             selection
//         ];

//         db.query(sql, values, (error, results) => {
//             if (error) {
//                 console.error('Error inserting data:', error);
//                 return res.status(500).send('Error inserting data');
//             }
//             res.send('Registration successful');
//         });
//     } catch (err) {
//         console.error('Error processing password:', err);
//         res.status(500).send('Error processing password');
//     }
// });

//LOGIN
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const sql = 'SELECT * FROM tbl_users WHERE username = ?';
//         db.query(sql, [username], async (error, results) => {
//             if (error) {
//                 console.error('Error fetching user:', error);
//                 return res.redirect('/login');
//             }

//             if (results.length === 0) {
//                 return res.status(401).send('Invalid username or password');
//             }

//             const user = results[0];
//             const isMatch = await comparePassword(password, user.password);

//             if (isMatch) {
//                 return res.redirect('/client_dashboard');
//             } else {
//                 return res.status(401).send('Invalid username or password');
//             }
//         });
//     } catch (err) {
//         console.error('Error processing login:', err);
//         res.status(500).send('Error processing login');
//     }
// });
