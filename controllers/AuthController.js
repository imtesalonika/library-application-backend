const express = require('express')
const router = express.Router()
const { login, completeData } = require('../service/AuthService')

router.post('/login', login)
router.post('/complete-data', completeData)

module.exports = router
