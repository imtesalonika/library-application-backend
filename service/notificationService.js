const admin = require('../config/firebaseAdmin')
const cron = require('node-cron')
const pool = require('../config/database')
const moment = require('moment-timezone')

// Konfigurasi waktu notifikasi (dapat disesuaikan secara manual)
const notificationSchedule = {
  minute: 7, // Jalankan pada menit ke-25
  hour: 15, // Jalankan pada jam 00:25
}

// Kirim notifikasi ke satu pengguna berdasarkan token
const sendNotificationToUser = async (token, title, body) => {
  if (!token) {
    console.warn('⚠️ Token FCM tidak ditemukan.')
    return
  }

  console.log(
    `📢 Mengirim notifikasi ke ${token} dengan judul: "${title}" dan isi: "${body}"`
  )

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

// Fungsi untuk memeriksa batas peminjaman buku dan mengirim notifikasi
const checkBookLoanDeadlines = async () => {
  try {
    const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD')

    // Query untuk mendapatkan peminjaman yang masih dipinjam
    const query = `
      SELECT 
        p.id AS id_peminjaman,
        p.id_user,
        u.name AS nama_peminjam,
        u.fcm_token,
        b.judul AS judul_buku,
        p.batas_peminjaman,
        DATEDIFF(p.batas_peminjaman, NOW()) AS sisa_hari
      FROM peminjaman p
      JOIN users u ON p.id_user = u.id
      JOIN buku b ON p.id_buku = b.id
      WHERE 
        p.status = 'IS BEING BORROWED'
        AND p.tanggal_kembali IS NULL
        AND u.fcm_token IS NOT NULL
    `

    const [loans] = await pool.query(query)
    console.log(`🔍 Memeriksa ${loans.length} peminjaman buku aktif.`)

    for (const loan of loans) {
      const batasPeminjaman = moment(loan.batas_peminjaman).tz('Asia/Jakarta')
      const today = moment().tz('Asia/Jakarta')
      const sisaHari = batasPeminjaman.diff(today, 'days')

      // Format tanggal untuk ditampilkan
      const formattedDeadline = batasPeminjaman.format('DD/MM/YYYY')

      // Debugging tambahan
      console.log(
        `📆 Buku "${loan.judul_buku}" - Sisa hari: ${sisaHari} (batas: ${formattedDeadline})`
      )

      if (!loan.fcm_token) {
        console.log(
          `⚠️ Token FCM tidak ditemukan untuk ${loan.nama_peminjam}, notifikasi tidak dikirim.`
        )
        continue
      }

      // Kondisi notifikasi
      if (sisaHari === 0) {
        await sendNotificationToUser(
          loan.fcm_token,
          'Batas Peminjaman Buku Hari Ini!',
          `Buku "${loan.judul_buku}" harus dikembalikan HARI INI (${formattedDeadline}). Silahkan segera kembalikan untuk menghindari denda.`
        )
      } else if (sisaHari === 1) {
        await sendNotificationToUser(
          loan.fcm_token,
          'Batas Peminjaman Buku Besok!',
          `Buku "${loan.judul_buku}" harus dikembalikan BESOK (${formattedDeadline}). Tersisa 1 hari sebelum batas waktu.`
        )
      } else if (sisaHari === 2) {
        await sendNotificationToUser(
          loan.fcm_token,
          'Pengingat Peminjaman Buku!',
          `Buku "${loan.judul_buku}" harus dikembalikan dalam 2 hari (${formattedDeadline}). Segera persiapkan pengembalian!`
        )
      } else if (sisaHari === 3) {
        await sendNotificationToUser(
          loan.fcm_token,
          'Pengingat Peminjaman Buku',
          `Buku "${loan.judul_buku}" harus dikembalikan pada ${formattedDeadline}. Tersisa 3 hari sebelum batas waktu.`
        )
      } else if (sisaHari < 0) {
        const telat = Math.abs(sisaHari)
        const denda = telat * 2000 // Rp2.000 per hari keterlambatan

        await sendNotificationToUser(
          loan.fcm_token,
          'Peminjaman Buku Telah Melewati Batas Waktu!',
          `Buku "${loan.judul_buku}" seharusnya dikembalikan pada ${formattedDeadline}. Peminjaman telah terlambat ${telat} hari. Denda saat ini: Rp${denda.toLocaleString('id-ID')}. Harap segera kembalikan untuk menghindari denda lebih besar.`
        )
      }
    }
  } catch (error) {
    console.error('❌ Error saat memeriksa batas peminjaman:', error)
  }
}

// Jadwal Notifikasi Harian untuk Pengingat Batas Peminjaman
cron.schedule(
  `${notificationSchedule.minute} ${notificationSchedule.hour} * * *`,
  async () => {
    console.log(
      `⏰ Menjalankan pengecekan batas peminjaman buku pukul ${notificationSchedule.hour}:${notificationSchedule.minute}`
    )
    await checkBookLoanDeadlines()
  }
)

// Fungsi untuk menjalankan pemeriksaan manual (bisa dipanggil dari API jika diperlukan)
const runManualDeadlineCheck = async () => {
  console.log('🔄 Menjalankan pemeriksaan batas peminjaman manual')
  await checkBookLoanDeadlines()
  return {
    success: true,
    message: 'Pemeriksaan batas waktu berhasil dijalankan',
  }
}

module.exports = {
  sendNotificationToUser,
  sendMultipleNotifications,
  runManualDeadlineCheck,
}
