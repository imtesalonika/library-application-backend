const pool = require('../config/database')

const calculateFileSize = (sizeInBytes) => {
  return sizeInBytes / (1024 * 1024)
}

const getAll = async (req, res) => {
  try {
    const [rowsPosts] = await pool.query(`
       SELECT * FROM pengumuman;
   `)
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
      `
      INSERT INTO pengumuman (
          judul,
          isi, 
          kategori, 
          file
          ) 
      VALUES (?, ?, ?, ?) 
    `,
      [judul, isi, kategori, JSON.stringify(tempFile)]
    )

    return res.status(200).json({ data: `Pengumuman berhasil ditambahkan!` })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Gagal menambahkan pengumuman!' })
  }
}

const getById = async (req, res) => {
  const id = req.params.id

  try {
    const [rows] = await pool.query(`SELECT * FROM pengumuman WHERE id = ${id}`)
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Pengumuman tidak ditemukan!',
        data: null,
      })
    }
    return res.status(200).json({ message: 'success', data: rows[0] })
  } catch (error) {
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
  const id = req.params.id // ID dari parameter URL
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
    const [pengumuman] = await pool.query(
      `SELECT * FROM pengumuman WHERE id = ${id}`
    )
    if (pengumuman.length === 0) {
      return res.status(404).json({
        message: `Pengumuman dengan id ${id} tidak ditemukan!`,
        data: null,
      })
    }

    // Update data user
    await pool.query(
      `
            UPDATE pengumuman 
            SET 
            judul = ?, 
            isi = ?,
            kategori = ?,
            file = ?
            WHERE id = ?;
        `,
      [
        !judul ? pengumuman[0].judul : judul,
        !isi ? pengumuman[0].isi : isi,
        !kategori ? pengumuman[0].kategori : kategori,
        JSON.stringify(tempFile),
        +id,
      ]
    )

    return res
      .status(200)
      .json({ message: 'Pengumuman berhasil disunting.', data: null })
  } catch (error) {
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
