const pool = require('../config/database')

const getAll = async (req, res) => {
  try {
    const [rowsPosts] = await pool.query(`
       SELECT * FROM buku;
   `)
    return res.status(200).json({
      message: 'success',
      data: rowsPosts,
    })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: 'Gagal untuk mendapatkan buku!' })
  }
}

const create = async (req, res) => {
  const {
    judul,
    penulis,
    penerbit,
    tahun_terbit,
    isbn,
    jumlah_halaman,
    bahasa,
    edisi,
    abstrak,
    status,
    banyak_buku,
  } = req.body

  // if (!req.file) {
  //   return res.status(400).send('Tidak ada gambar buku yang diupload!')
  // }

  const picturePath = req.file ? `books/${req.file.filename}` : null

  try {
    const [postBuku] = await pool.query(`
      INSERT INTO buku (
          judul,
          penulis,
          penerbit,
          tahun_terbit,
          isbn,
          jumlah_halaman,
          bahasa,
          edisi,
          abstrak,
          status,
          banyak_buku,
          gambar
          ) 
      VALUES (
          "${judul}",
          "${penulis}",
          "${penerbit}",
          "${+tahun_terbit}",
          "${isbn}",
          "${+jumlah_halaman}",
          "${bahasa}",
          "${edisi}",
          "${abstrak}",
          "${status === 'true' ? 1 : 0}",
          "${+banyak_buku}",
          "${picturePath}"
          ) 
    `)

    return res.status(200).json({ data: `Buku berhasil ditambahkan!` })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Gagal menambahkan buku!' })
  }
}

const getById = async (req, res) => {
  const id = req.params.id

  try {
    const [rows] = await pool.query(`SELECT * FROM products WHERE id = ${id}`)
    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Produk tidak ada!`,
      })
    }
    return res.status(200).json({ status: 'ok', data: rows })
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'Produk tidak ditemukan' })
  }
}

const remove = async (req, res) => {
  const id = req.params.id

  try {
    const [product] = await pool.query(`SELECT * FROM posts WHERE id = ${id}`)
    if (product.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Post tidak ditemukan!`,
      })
    }

    await pool.query(`DELETE FROM posts WHERE id = ${id}`)
    return res.status(200).json({ status: 'ok', data: product })
  } catch (error) {
    console.error(error)
    return res
      .status(404)
      .json({ message: 'Gagal menghapus post. Error tidak diketahui.' })
  }
}

const update = async (req, res) => {
  const id = req.params.id // ID dari parameter URL
  const { name, pekerjaan, username, email, password, saldo } = req.body // Data dari body request

  try {
    const [user] = await pool.query(`SELECT * FROM users WHERE id = ${id}`)
    if (user.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `User dengan id ${id} tidak ditemukan!`,
      })
    }

    let hashedPassword = user[0].password
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    // Update data user
    await pool.query(
      `
            UPDATE users 
            SET name = ?, pekerjaan = ?, username = ?, email = ?, password = ?, saldo = ?, updatedAt = NOW()
            WHERE id = ?;
        `,
      [name, pekerjaan, username, email, hashedPassword, saldo, id]
    )

    return res
      .status(200)
      .json({ status: 'ok', message: 'User updated successfully' })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Error updating user', error })
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
}
