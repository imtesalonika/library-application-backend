const express = require('express')
const router = express.Router()
const { login, completeData, loginMobile, visit, getTotalVisit } = require('../service/AuthService')

router.post('/login', login)
router.post('/complete-data', completeData)
router.post('/login-mobile', loginMobile)
router.get('/log', visit)
router.get('/visitor', getTotalVisit)

module.exports = router