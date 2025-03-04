const pool = require('../config/database')

const getAll = async (req, res) => {
  const { status } = req.query // Ambil parameter status dari query

  try {
    let query = `
      SELECT 
        peminjaman.id,
        peminjaman.id_buku,
        buku.judul AS judul_buku,
        peminjaman.id_user,
        users.name AS nama_user,
        peminjaman.tanggal_pinjam,
        peminjaman.batas_peminjaman,
        peminjaman.tanggal_kembali,
        peminjaman.status,
        peminjaman.gambar,
        peminjaman.created_at,
        peminjaman.updated_at
        peminjaman
      FROM peminjaman
      JOIN buku ON peminjaman.id_buku = buku.id
      JOIN users ON peminjaman.id_user = users.id
    `

    let params = []
    if (status) {
      query += ` WHERE peminjaman.status = ?` // Tambahkan kondisi WHERE jika ada status
      params.push(status)
    }

    const [rows] = await pool.query(query, params) // Jalankan query dengan atau tanpa parameter status

    return res.status(200).json({ message: 'success', data: rows })
  } catch (error) {
    console.error(error)
    return res
      .status(400)
      .json({ message: 'Gagal mendapatkan data peminjaman!', data: null })
  }
}

const create = async (req, res) => {
  const { id_buku, id_user, tanggal_pinjam, status, gambar } = req.body

  if (!id_buku || !id_user || !tanggal_pinjam || !status) {
    return res
      .status(400)
      .json({ message: 'Semua field harus diisi!', data: null })
  }

  try {
    // Include gambar field in the query
    const [result] = await pool.query(
      `INSERT INTO peminjaman (id_buku, id_user, tanggal_pinjam, status, gambar) VALUES (?, ?, ?, ?, ?);`,
      [id_buku, id_user, tanggal_pinjam, status, gambar]
    )
    return res.status(201).json({
      message: 'Peminjaman berhasil ditambahkan.',
      data: { id: result.insertId },
    })
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json({ message: 'Gagal menambahkan peminjaman!', data: null })
  }
}

const getById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.query(`SELECT * FROM peminjaman WHERE id = ?;`, [
      id,
    ])
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Peminjaman tidak ditemukan!', data: null })
    }
    return res.status(200).json({ message: 'success', data: rows[0] })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal mendapatkan data peminjaman!', data: null })
  }
}

const remove = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query(`DELETE FROM peminjaman WHERE id = ?;`, [
      id,
    ])
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Peminjaman tidak ditemukan!', data: null })
    }
    return res
      .status(200)
      .json({ message: 'Peminjaman berhasil dihapus.', data: null })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal menghapus peminjaman!', data: null })
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ message: 'Status harus diisi!', data: null })
  }

  try {
    let query, params
    if (status === 'DONE') {
      query = `UPDATE peminjaman SET status = ?, tanggal_kembali = ? WHERE id = ?;`
      params = [status, new Date(), id]
    } else {
      query = `UPDATE peminjaman SET status = ? WHERE id = ?;`
      params = [status, id]
    }

    const [result] = await pool.query(query, params)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Peminjaman tidak ditemukan!', data: null })
    }

    return res
      .status(200)
      .json({ message: 'Status peminjaman diperbarui.', data: null })
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json({ message: 'Gagal memperbarui status peminjaman!', data: null })
  }
}

module.exports = { getAll, create, getById, remove, update }
