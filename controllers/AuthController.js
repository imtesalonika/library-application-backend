const express = require('express')
const router = express.Router()
const { login, checkAuth } = require('../service/AuthService')

router.post('/login', login)

module.exports = router
