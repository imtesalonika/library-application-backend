const express = require('express')
const router = express.Router()
const { login, completeData, loginMobile, visit } = require('../service/AuthService')

router.post('/login', login)
router.post('/complete-data', completeData)
router.post('/login-mobile', loginMobile)
router.get('/log', visit)

module.exports = router