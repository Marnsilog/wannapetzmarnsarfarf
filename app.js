const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname,'public/index')));

app.listen (300, ()=> {
    console.log("App Listening on port 300")
})