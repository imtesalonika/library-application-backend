const pool = require('../config/database')
const { sendMultipleNotifications } = require('../service/notificationService')

const calculateFileSize = (sizeInBytes) => {
  return sizeInBytes / (1024 * 1024)
}

const express = require('express')
const router = express.Router()
const upload = require('../multerConfig')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const uploadPath = path.join(__dirname, '../public/pengumuman_files')

// Buat folder jika belum ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

// Pastikan MIME type diizinkan
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, uploadPath)
    } else {
      cb(new Error('File type not allowed'), false)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

router.post('/pengumuman', upload.array('files'), async (req, res) => {
  const { judul, isi, kategori } = req.body
  const files = req.files
  const tempFile = []

  files.forEach((file) => {
    tempFile.push({
      originalFilename: file.originalname,
      location: `/uploads/${file.filename}`, // URL file
      filename: file.filename,
      fileSize: `${calculateFileSize(file.size).toFixed(2)} MB`,
    })
  })

  try {
    await pool.query(
      `INSERT INTO pengumuman (judul, isi, kategori, file) VALUES (?, ?, ?, ?)`,
      [judul, isi, kategori, JSON.stringify(tempFile)]
    )

    return res.status(200).json({ data: `Pengumuman berhasil ditambahkan!` })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: 'Gagal menambahkan pengumuman!' })
  }
})

const getAll = async (req, res) => {
  try {
    const [rowsPosts] = await pool.query(`
       SELECT * FROM pengumuman ORDER BY updated_at DESC;
   `)

    console.log(rowsPosts)

    return res.status(200).json({
      message: 'success',
      data: rowsPosts,
    })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal untuk mendapatkan pengumuman!', data: null })
  }
}

const create = async (req, res) => {
  const { judul, isi, kategori } = req.body
  const files = req.files
  const tempFile = []

  files.forEach((file) => {
    tempFile.push({
      originalFilename: file.originalname,
      location: `pengumuman_files/${file.filename}`,
      filename: file.filename,
      fileSize: `${calculateFileSize(file.size).toFixed(2)} MB`,
    })
  })

  try {
    await pool.query(
      `INSERT INTO pengumuman (judul, isi, kategori, file) VALUES (?, ?, ?, ?)`,
      [judul, isi, kategori, JSON.stringify(tempFile)] // Simpan sebagai string JSON
    )

    // 🔹 Ambil semua FCM token dari user yang valid
    const [users] = await pool.query(
      `SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL`
    )
    const tokens = users.map((user) => user.fcm_token).filter((token) => token)

    // 🔹 Kirim notifikasi ke semua user jika ada token yang tersedia
    if (tokens.length > 0) {
      await sendMultipleNotifications(
        tokens,
        'Pengumuman Baru 📢',
        `Ada pengumuman terbaru. Cek sekarang!`
      )
    }

    return res.status(200).json({ data: `Pengumuman berhasil ditambahkan!` })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: 'Gagal menambahkan pengumuman!' })
  }
}

const getById = async (req, res) => {
  const id = req.params.id

  try {
    const [rows] = await pool.query(`SELECT * FROM pengumuman WHERE id = ?`, [
      id,
    ])
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Pengumuman tidak ditemukan!',
        data: null,
      })
    }

    // Parse data file dari string JSON ke array
    const pengumuman = rows[0]
    if (pengumuman.file) {
      try {
        pengumuman.file = JSON.parse(pengumuman.file)
      } catch (parseError) {
        console.error('Error parsing file JSON:', parseError)
        pengumuman.file = []
      }
    }

    return res.status(200).json({ message: 'success', data: pengumuman })
  } catch (error) {
    console.error('Error in getById:', error)
    return res.status(404).json({ message: 'Pengumuman tidak ditemukan' })
  }
}
const remove = async (req, res) => {
  const id = req.params.id

  try {
    const [pengumuman] = await pool.query(
      `SELECT * FROM pengumuman WHERE id = ${id}`
    )
    if (pengumuman.length === 0) {
      return res.status(404).json({
        message: 'Pengumuman tidak ditemukan!',
        data: null,
      })
    }

    await pool.query(`DELETE FROM pengumuman WHERE id = ${id}`)
    return res.status(200).json({
      message: `Berhasil menghapus pengumuman ${pengumuman[0].judul}`,
      data: pengumuman,
    })
  } catch (error) {
    return res
      .status(404)
      .json({ message: 'Gagal menghapus pengumuman. Error tidak diketahui.' })
  }
}

const update = async (req, res) => {
  const id = req.params.id
  const { judul, isi, kategori, oldFiles } = req.body
  const files = req.files
  const tempFile = []

  files.forEach((file) => {
    tempFile.push({
      originalFilename: file.originalname,
      location: `pengumuman_files/${file.filename}`,
      filename: file.filename,
      fileSize: `${calculateFileSize(file.size).toFixed(2)} MB`,
    })
  })

  if (oldFiles) {
    JSON.parse(oldFiles).forEach((oldFile) => {
      tempFile.push(oldFile)
    })
  }

  try {
    const [pengumuman] = await pool.query(
      `SELECT * FROM pengumuman WHERE id = ?`,
      [id]
    )
    if (pengumuman.length === 0) {
      return res.status(404).json({
        message: `Pengumuman dengan id ${id} tidak ditemukan!`,
        data: null,
      })
    }

    await pool.query(
      `UPDATE pengumuman SET judul = ?, isi = ?, kategori = ?, file = ? WHERE id = ?`,
      [
        judul || pengumuman[0].judul,
        isi || pengumuman[0].isi,
        kategori || pengumuman[0].kategori,
        JSON.stringify(tempFile), // Simpan sebagai string JSON
        id,
      ]
    )

    return res
      .status(200)
      .json({ message: 'Pengumuman berhasil disunting.', data: null })
  } catch (error) {
    console.error(error)
    return res
      .status(400)
      .json({ message: 'Gagal menyunting pengumuman', data: error })
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
}
