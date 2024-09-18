const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config({ path: './.env' });
const session = require('express-session');
const fileUpload = require('express-fileupload'); 
const MySQLStore = require('express-mysql-session')(session);

const app = express();

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('MySQL connected as id ' + db.threadId);
});

// Set up MySQL session store
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.set('view engine', 'hbs');

app.use(session({
    secret: 'ampotangina',
    store: sessionStore,  // Use the MySQLStore instance
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60 * 24  
    }
}));

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
