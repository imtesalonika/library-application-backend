const admin = require('../config/firebaseAdmin')

// Kirim notifikasi ke satu pengguna berdasarkan token
const sendNotificationToUser = async (token, title, body) => {
  if (!token) {
    console.warn('⚠️ Token FCM tidak ditemukan.')
    return
  }

  const message = {
    notification: { title, body },
    token,
  }

  try {
    const response = await admin.messaging().send(message)
    console.log('✅ Notifikasi terkirim:', response)
    return response
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi:', error.message)
  }
}

// Kirim notifikasi ke banyak perangkat
const sendMultipleNotifications = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) {
    console.log('🚨 No FCM tokens found')
    return
  }

  const message = {
    notification: { title, body },
    tokens, // Tetap gunakan tokens untuk pengiriman multiple
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(message)
    console.log('✅ Notifications sent:', response)

    if (response.failureCount > 0) {
      console.log(
        '⚠️ Some notifications failed:',
        response.responses.filter((r) => !r.success)
      )
    }
  } catch (error) {
    console.error('❌ Error sending notifications:', error.message)
  }
}

module.exports = {
  sendNotificationToUser,
  sendMultipleNotifications,
}
