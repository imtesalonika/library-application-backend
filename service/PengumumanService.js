const pool = require('../config/database')

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

  // const filePath = req.file ? `pengumuman/${req.file.filename}` : null

  try {
    await pool.query(`
      INSERT INTO pengumuman (
          judul,
          isi, 
          kategori
          ) 
      VALUES (
          "${judul}",
          "${isi}",
          "${kategori}"
          ) 
    `)

    return res.status(200).json({ data: `Pengumuman berhasil ditambahkan!` })
  } catch (error) {
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

  // const picturePath = req.file ? `books/${req.file.filename}` : null

  try {
    const [pengumuman] = await pool.query(
      `SELECT * FROM pengumuman WHERE id = ${id}`
    )
    if (pengumuman.length === 0) {
      return res.status(404).json({
        message: `Buku dengan id ${id} tidak ditemukan!`,
        data: null,
      })
    }

    // Update data user
    await pool.query(
      `
            UPDATE buku 
            SET 
            judul = ?, 
            isi = ?,
            kategori = ?
            WHERE id = ?;
        `,
      [
        !judul ? pengumuman[0].judul : judul,
        !isi ? pengumuman[0].isi : isi,
        !kategori ? pengumuman[0].kategori : kategori,
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
