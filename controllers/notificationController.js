const express = require('express')
const router = express.Router()
const {
  sendNotification,
  sendMultipleNotifications,
  sendTopicNotification,
} = require('../service/notificationService')

router.post('/send-notification', sendNotification)
router.post('/send-multiple-notifications', sendMultipleNotifications)
router.post('/send-topic-notification', sendTopicNotification)

module.exports = router
