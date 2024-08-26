// app.js
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './.env' });
const session = require('express-session');
const fileUpload = require('express-fileupload'); // Add this line

const app = express();

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

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload()); // Add this line
app.set('view engine', 'hbs');

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Set secure to true in production
}));

// Include routes
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
