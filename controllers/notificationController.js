const express = require('express')
const {
  sendNotificationToUser,
  sendMultipleNotifications,
} = require('../service/notificationService')

const router = express.Router()

router.post('/send-notification', sendNotificationToUser)
router.post('/send-multiple-notifications', sendMultipleNotifications)

module.exports = router
