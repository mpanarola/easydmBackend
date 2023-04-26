const express = require('express')
const router = express.Router()
const contentScheduler = require('../controller/contentScheduler.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/create_scheduler', authMiddleware, contentScheduler.createContentScheduler)
router.get('/activity_scheduler/:id', authMiddleware, contentScheduler.viewActivity)
router.get('/get_scheduler_ById/:id', authMiddleware, contentScheduler.getContentSchedulersById)

module.exports = router;