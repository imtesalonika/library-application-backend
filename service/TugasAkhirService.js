const pool = require('../config/database')

const getAll = async (req, res) => {
  try {
    const [rowsPosts] = await pool.query(`SELECT * FROM tugasakhir;`)
    return res.status(200).json({
      message: 'success',
      data: rowsPosts,
    })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal untuk mendapatkan tugas akhir!', data: null })
  }
}

const create = async (req, res) => {
  const {
    judul,
    penulis,
    pembimbing,
    fakultas,
    prodi,
    katakunci,
    abstrak,
    tahun,
    lokasi,
  } = req.body

  try {
    const [postTugasAkhir] = await pool.query(
      `INSERT INTO tugasakhir (judul, penulis, pembimbing, fakultas, prodi, katakunci, abstrak, tahun, lokasi) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judul,
        penulis,
        pembimbing,
        fakultas,
        prodi,
        katakunci,
        abstrak,
        tahun,
        lokasi,
      ]
    )

    return res
      .status(200)
      .json({ message: `Tugas Akhir berhasil ditambahkan!` })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: 'Gagal menambahkan Tugas Akhir!' })
  }
}

const getById = async (req, res) => {
  const id = req.params.id

  try {
    const [rows] = await pool.query(`SELECT * FROM tugasakhir WHERE id = ${id}`)
    if (rows.length === 0) {
      return res.status(404).json({
        message: ` Tugas Akhir tidak ada!`,
      })
    }
    return res.status(200).json({ message: 'success', data: rows[0] })
  } catch (error) {
    return res.status(404).json({ message: 'Tugas Akhir tidak ditemukan' })
  }
}

const remove = async (req, res) => {
  const id = req.params.id

  try {
    const [tugasakhir] = await pool.query(
      `SELECT * FROM tugasakhir WHERE id = ${id}`
    )
    if (tugasakhir.length === 0) {
      return res.status(404).json({
        message: 'Tugas Akhir tidak ditemukan!',
        data: null,
      })
    }

    await pool.query(`DELETE FROM tugasakhir WHERE id = ${id}`)
    return res.status(200).json({
      message: `Berhasil menghapus Tugas Akhir ${tugasakhir[0].judul}`,
      data: tugasakhir,
    })
  } catch (error) {
    return res
      .status(404)
      .json({ message: 'Gagal menghapus Tugas Akhir. Error tidak diketahui.' })
  }
}

const update = async (req, res) => {
  const id = req.params.id
  const {
    judul,
    penulis,
    pembimbing,
    fakultas,
    prodi,
    katakunci,
    abstrak,
    tahun,
    lokasi,
  } = req.body

  const picturePath = req.file ? ` tugasakhir/${req.file.filename}` : null

  try {
    const [tugasakhir] = await pool.query(
      `SELECT * FROM tugasakhir WHERE id = ${id}`
    )
    if (tugasakhir.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Tugas Akhir dengan id ${id} tidak ditemukan!`,
      })
    }

    console.log(tugasakhir)

    // Update data user
    await pool.query(
      `UPDATE tugasakhir 
       SET 
       judul = ?, 
       penulis = ?,  
       pembimbing = ?, 
       fakultas = ?, 
       prodi = ?, 
       katakunci = ?,  
       abstrak = ?,
       tahun = ?, 
       lokasi = ?
       WHERE id = ?;`,
      [
        judul || tugasakhir[0].judul,
        penulis || tugasakhir[0].penulis,
        pembimbing || tugasakhir[0].pembimbing,
        fakultas || tugasakhir[0].fakultas,
        prodi || tugasakhir[0].prodi,
        katakunci || tugasakhir[0].katakunci,
        abstrak || tugasakhir[0].abstrak,
        tahun || tugasakhir[0].tahun,
        lokasi || tugasakhir[0].lokasi,
        +id,
      ]
    )

    return res
      .status(200)
      .json({ message: 'Tugas Akhir berhasil disunting.', data: null })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal menyunting Tugas Akhir', data: error })
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
}
