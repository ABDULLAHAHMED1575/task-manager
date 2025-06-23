const express = require('express');
const cors = require('cors');
const router = require('./src/router')
const {PORT,HOST,CORSORIGIN} = require("./core/config")

const app = express();

app.use(cors({
    origin:CORSORIGIN,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/', router)

app.listen(PORT,HOST, ()=>{
    console.log(`Server running at http://${HOST}:${PORT}`)
})