// app.js
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // For generating secure tokens
const nodemailer = require('nodemailer'); // For sending emails
require('dotenv').config({ path: './.env' });
const session = require('express-session');
const fileUpload = require('express-fileupload'); 

const app = express();

// Database connection
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


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.set('view engine', 'hbs');



app.use(session({
    secret: 'ampotangina',
    resave: false,
    cookie: { secure: false },
    saveUninitialized: true
}));;

app.post('/email-send', async (req, res) => {
    const { email } = req.body;
    const user = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'No account with that email found.' });
      //res.redirect('/login');
    }
    const token = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 3600000;
    await db.query('UPDATE tbl_users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [token, expireTime, email]);
    const resetLink = `http://${req.headers.host}/reset-password/${token}`;
  
    // Send an email with the reset link
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'renzolimpiya@gmail.com',
        pass: 'tsbd jniv lewh nsxh',
      },
    });
  
    const mailOptions = {
      to: email,
      from: 'renzolimpiya@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetLink}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
  
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Reset link sent to your email.' });
  });

app.get('/reset-password/:token', (req, res) => {
    const token = req.params.token;
    res.sendFile(path.join(__dirname, 'public', 'reset_pass.html'), {
        headers: {
            'token': token // This header can be used if needed
        }
    });
});

  app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
  
    const user = await db.query('SELECT * FROM tbl_users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?', [token, Date.now()]);
  
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE tbl_users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE user_id = ?', [hashedPassword, user.id]);
  
    res.status(200).json({ message: 'Your password has been updated.' });
  });

const pages = require('./routes/pages');
const auth = require('./routes/auth');
app.use('/', pages);
app.use('/auth', auth);
app.use('/savedpic', express.static(path.join(__dirname, 'savedpic')));
app.use('/savedvideo', express.static(path.join(__dirname, 'savedvideo')));
app.use('/savedprofilepic', express.static(path.join(__dirname, 'savedprofilepic')));


// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
