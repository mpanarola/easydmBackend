const express = require('express')
const app = express()
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
require('dotenv').config()
require('./util/connection')
// require('./seed').userSeed()   //It will create default Admin user. After setup project and database, comment this line.

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use("/avatar", express.static(path.join(__dirname, '/public/avatar')));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
})
app.use(require('./route/index'))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}!!!`);
})