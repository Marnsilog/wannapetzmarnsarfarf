const express = require('express');
const mysql = require('mysql');
require('dotenv').config({ path: './.env' }); // Ensure the correct path to your .env file

const app = express();

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

app.set('view engnine', 'hbs')

app.get('/', (req, res) => {
    res.send('<h1>Wannapetz APP</h1>');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
