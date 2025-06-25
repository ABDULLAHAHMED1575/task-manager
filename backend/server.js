const express = require('express');
const cors = require('cors');
const router = require('./src/router')
const {PORT,HOST,CORSORIGIN} = require("./core/config")
const db = require('./core/db')
const {setupPassport} = require('./middleware/passportMiddleware')

const app = express();

app.use(cors({
    origin:CORSORIGIN,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupPassport(app);
app.use('/', router);

db.raw('SELECT 1')
.then(()=>{
    console.log('Database connection successful!');
    app.listen(PORT, ()=>{
        console.log(`Server running at http://localhost:${PORT}`)
    })
})
.catch((err) =>{
    console.error("Database connection failed:",err.message);
    process.exit(1);
});

