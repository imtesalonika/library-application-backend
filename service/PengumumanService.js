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
  const id = req.params.id
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
    // Ambil data pengumuman berdasarkan ID
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

    // Perbaiki kesalahan pengambilan file
    const updatedFile =
      files.length > 0 ? tempFile : JSON.parse(pengumuman[0].file)

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
        judul || pengumuman[0].judul,
        isi || pengumuman[0].isi,
        kategori || pengumuman[0].kategori,
        JSON.stringify(updatedFile),
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
