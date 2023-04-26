const express = require('express')
const router = express.Router()

router.use(
    require('./auth.route'),
    require('./website.route'),
    require('./contentScheduler.route')
)

module.exports = router