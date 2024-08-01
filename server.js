const express = require('express')

const app = express()

app.get('/test', (req,res)=> {
    res.status(200).send('<h1>Wannapetz APP</h1>')
})

const PORT = 8080;

app.listen(PORT, () =>{
    console.log("Server Running")
})