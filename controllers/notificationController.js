const express = require('express')
const {
  sendNotificationToUser,
  sendMultipleNotifications,
  runManualDeadlineCheck,
} = require('../service/notificationService')

const router = express.Router()

router.post('/send-notification', sendNotificationToUser)
router.post('/send-multiple-notifications', sendMultipleNotifications)
router.post('/check-deadlines', async (req, res) => {
  try {
    const result = await runManualDeadlineCheck()
    return res.status(200).json(result)
  } catch (error) {
    console.error('Error running manual deadline check:', error)
    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan pemeriksaan batas waktu',
    })
  }
})

module.exports = router
