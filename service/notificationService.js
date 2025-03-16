const admin = require('../config/firebaseAdmin')

// Kirim notifikasi ke satu perangkat
const sendNotification = async (req, res) => {
  try {
    const { title, body, token } = req.body

    if (!title || !body || !token) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' })
    }

    const message = {
      notification: { title, body },
      token, // Kirim ke satu perangkat
    }

    const response = await admin.messaging().send(message)
    res
      .status(200)
      .json({ success: true, message: 'Notifikasi terkirim!', response })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Kirim notifikasi ke banyak perangkat
const sendMultipleNotifications = async (req, res) => {
  try {
    const { title, body, tokens } = req.body

    if (!title || !body || !tokens || !Array.isArray(tokens)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid request format' })
    }

    const message = {
      notification: { title, body },
      tokens, // Kirim ke banyak perangkat
    }

    const response = await admin.messaging().sendMulticast(message)
    res.status(200).json({
      success: true,
      message: 'Notifikasi multicast terkirim!',
      response,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Kirim notifikasi ke topik tertentu
const sendTopicNotification = async (req, res) => {
  try {
    const { title, body, topic } = req.body

    if (!title || !body || !topic) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' })
    }

    const message = {
      notification: { title, body },
      topic, // Kirim ke semua yang subscribe ke topic ini
    }

    const response = await admin.messaging().send(message)
    res.status(200).json({
      success: true,
      message: 'Notifikasi ke topik terkirim!',
      response,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = {
  sendNotification,
  sendMultipleNotifications,
  sendTopicNotification,
}
