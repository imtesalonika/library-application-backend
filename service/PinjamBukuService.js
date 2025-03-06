const pool = require('../config/database')

const getAll = async (req, res) => {
  const { start_date, end_date } = req.query // Ambil parameter status dari query

  try {
    let query = `SELECT 
          p.id AS id_peminjaman,
          p.id_buku,
          b.judul AS judul_buku,
          b.penulis,
          b.penerbit,
          b.tahun_terbit,
          b.isbn,
          b.jumlah_halaman,
          b.bahasa,
          b.edisi,
          b.abstrak,
          b.status AS status_buku,
          b.lokasi AS lokasi_buku,
          b.banyak_buku,
          b.gambar AS gambar_buku,
          p.id_user,
          u.name AS nama_peminjam,
          u.username,
          u.email,
          u.role,
          u.status AS status_user,
          u.jabatan,
          u.foto_profil,
          p.tanggal_request,
          p.tanggal_pinjam,
          p.batas_peminjaman,
          p.tanggal_kembali,
          p.status AS status_peminjaman,
          p.gambar AS gambar_peminjaman,
          p.created_at AS created_at_peminjaman,
          p.updated_at AS updated_at_peminjaman
      FROM peminjaman p
      JOIN users u ON p.id_user = u.id
      JOIN buku b ON p.id_buku = b.id
      WHERE 
          (COALESCE(?, '') = '' OR p.tanggal_request >= ?) 
          AND 
          (COALESCE(?, '') = '' OR p.tanggal_request <= ?)
      ORDER BY p.tanggal_request DESC;`

    const params = [
      start_date || null,
      start_date || null,
      end_date || null,
      end_date || null,
    ]

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
  const { id_buku, id_user, gambar } = req.body

  if (!id_buku || !id_user) {
    return res
      .status(400)
      .json({ message: 'Semua field harus diisi!', data: null })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO peminjaman (id_buku, id_user, tanggal_request, status, gambar) VALUES (?, ?, CURRENT_TIMESTAMP, 'REQ', ?);`,
      [id_buku, id_user, gambar] // Set status to 'REQ' and generate tanggal_request
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
    } else if (status === 'ACCEPTED') {
      query = `UPDATE peminjaman SET status = ?, tanggal_pinjam = ?, batas_peminjaman = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY) WHERE id = ?;`
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

const perpanjang = async (req, res) => {
  const { id } = req.params

  try {
    const [currentData] = await pool.query(
      `SELECT * from peminjaman WHERE id = ?;`,
      [id]
    )

    if (currentData[0].status === 'DONE') {
      await pool.query(
        `UPDATE peminjaman SET batas_peminjaman = DATE_ADD(batas_peminjaman, INTERVAL 7 DAY), tanggal_kembali = null, status = ? WHERE id = ?;`,
        ['IS BEING BORROWED', id]
      )
    } else {
      await pool.query(
        `UPDATE peminjaman SET batas_peminjaman = DATE_ADD(batas_peminjaman, INTERVAL 7 DAY) WHERE id = ?;`,
        [id]
      )
    }

    return res
      .status(200)
      .json({ message: 'Berhasil diperpanjang 7 hari.', data: null })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Gagal memperpanjang!', data: null })
  }
}

module.exports = { getAll, create, getById, remove, update, perpanjang }
