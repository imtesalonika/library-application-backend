const pool = require('../config/database')

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
       SELECT 
          peminjaman.id,
          peminjaman.id_buku,
          buku.judul AS judul_buku,
          peminjaman.id_user,
          users.name AS nama_user,
          peminjaman.tanggal_pinjam,
          peminjaman.tanggal_kembali,
          peminjaman.status,
          peminjaman.created_at,
          peminjaman.updated_at
        FROM peminjaman
        JOIN buku ON peminjaman.id_buku = buku.id
        JOIN users ON peminjaman.id_user = users.id;
   `)
    return res.status(200).json({
      message: 'success',
      data: rows,
    })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal untuk mendapatkan peminjaman!', data: null })
  }
}
const create = () => {}
const getById = () => {}
const remove = () => {}

const update = async (req, res) => {
  const id = req.params.id
  const { status } = req.body

  try {
    if (status !== 'DONE') {
      const [rows] = await pool.query(
        `
       UPDATE peminjaman 
            SET 
            status = ?
            WHERE id = ?;
   `,
        [status, +id]
      )
      return res.status(200).json({
        message:
          status === 'ACCEPTED'
            ? 'Peminjaman diizinkan.'
            : 'Peminjaman ditolak',
        data: rows,
      })
    } else {
      const [rows] = await pool.query(
        `
       UPDATE peminjaman 
            SET 
            status = ?,
            tanggal_kembali = ?
            WHERE id = ?;
   `,
        [status, new Date(), +id]
      )
      return res.status(200).json({
        message: 'Peminjaman Selesai.',
        data: rows,
      })
    }
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json({ message: 'Gagal melakukan aksi!', data: null })
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
}
