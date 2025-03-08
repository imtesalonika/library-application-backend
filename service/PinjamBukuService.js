const pool = require('../config/database')
const moment = require('moment-timezone')

const getAll = async (req, res) => {
  const { start_date, end_date } = req.query

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

    const [rows] = await pool.query(query, params)

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
    // Generate tanggal_request dengan zona waktu WIB
    const tanggal_request = moment
      .tz('Asia/Jakarta')
      .format('YYYY-MM-DD HH:mm:ss')

    const [temp_book] =  await pool.query(
      `SELECT * from buku where id = ?`,
      [id_buku]
    )

    if (temp_book[0].banyak_buku === 0) {
      return res.status(400).json({
        message : 'Buku sudah tidak tersedia.',
        data: null
      })
    }

    const [result] = await pool.query(
      `INSERT INTO peminjaman (id_buku, id_user, tanggal_request, status, gambar, batas_peminjaman) VALUES (?, ?, ?, 'REQ', ?, NULL);`,
      [id_buku, id_user, tanggal_request, gambar]
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

const update = async (req, res) => {
  const { id } = req.params
  const { status, id_buku } = req.body

  if (!status) {
    return res.status(400).json({ message: 'Status harus diisi!', data: null })
  }

  try {
    let query, params

    if (status === 'DONE') {
      // Generate tanggal_kembali dengan zona waktu WIB
      const tanggal_kembali = moment
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss')

      const [temp_book] =  await pool.query(
        `SELECT * from buku where id = ?`,
        [id_buku]
      )

      await pool.query(
        `UPDATE buku 
            SET 
            status = ?,
            banyak_buku = ?
            WHERE id = ?;`,
        [temp_book[0].banyak_buku + 1 > 0, temp_book[0].banyak_buku + 1, id_buku]
      )

      query = `UPDATE peminjaman SET status = ?, tanggal_kembali = ? WHERE id = ?;`
      params = [status, tanggal_kembali, id]
    } else if (status === 'IS BEING BORROWED') {
      const tanggal_pinjam = moment
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss')
      const batas_peminjaman = moment
        .tz('Asia/Jakarta')
        .add(7, 'days')
        .format('YYYY-MM-DD HH:mm:ss')

      const [temp_book] =  await pool.query(
        `SELECT * from buku where id = ?`,
        [id_buku]
      )

      if (temp_book[0].banyak_buku === 0) {
        return res.status(400).json({
          message : 'Buku sudah tidak tersedia.',
          data: null
        })
      }

      await pool.query(
        `UPDATE buku 
            SET 
            status = ?,
            banyak_buku = ?
            WHERE id = ?;`,
        [temp_book[0].banyak_buku - 1 > 0, temp_book[0].banyak_buku - 1, id_buku]
      )

      query = `UPDATE peminjaman SET status = ?, tanggal_pinjam = ?, batas_peminjaman = ? WHERE id = ?;`
      params = [status, tanggal_pinjam, batas_peminjaman, id]
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

    if (currentData.length === 0) {
      return res
        .status(404)
        .json({ message: 'Peminjaman tidak ditemukan!', data: null })
    }

    const peminjaman = currentData[0]

    if (peminjaman.status === 'DONE') {
      // Jika status DONE, reset tanggal_kembali dan perpanjang batas_peminjaman
      const batas_peminjaman = moment(peminjaman.batas_peminjaman)
        .add(7, 'days')
        .format('YYYY-MM-DD HH:mm:ss')

      await pool.query(
        `UPDATE peminjaman SET batas_peminjaman = ?, tanggal_kembali = NULL, status = ? WHERE id = ?;`,
        [batas_peminjaman, 'IS BEING BORROWED', id]
      )
    } else {
      // Jika status bukan DONE, perpanjang batas_peminjaman
      const batas_peminjaman = moment(peminjaman.batas_peminjaman)
        .add(7, 'days')
        .format('YYYY-MM-DD HH:mm:ss')

      await pool.query(
        `UPDATE peminjaman SET batas_peminjaman = ? WHERE id = ?;`,
        [batas_peminjaman, id]
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

module.exports = { getAll, create, update, perpanjang }
