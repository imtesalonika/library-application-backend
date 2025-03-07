const pool = require('../config/database')

const getAll = async (req, res) => {
  try {
    const { search, sort, order } = req.query // Ambil query parameter `search`, `sort`, dan `order`

    let query = `SELECT * FROM buku`
    let params = []

    if (search) {
      query += ` WHERE judul LIKE ?`
      params.push(`%${search}%`)
    }

    // Add sorting
    if (sort && order) {
      query += ` ORDER BY ${sort} ${order}`
    }

    const [rowsPosts] = await pool.query(query, params)

    return res.status(200).json({
      message: 'success',
      data: rowsPosts,
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Gagal untuk mendapatkan buku!',
      data: null,
      error: error.message,
    })
  }
}

const getFavorite = async (req, res) => {
  const { user_id } = req.params

  try {
    const [favorites] = await pool.query(
      `SELECT 
            b.id, 
            b.judul, 
            b.penulis, 
            b.penerbit, 
            b.tahun_terbit, 
            b.isbn, 
            b.jumlah_halaman, 
            b.bahasa, 
            b.edisi, 
            b.abstrak, 
            b.lokasi, 
            b.banyak_buku, 
            b.gambar, 
            uf.created_at AS favorited_at
        FROM buku_favorit_user uf
        JOIN buku b ON uf.buku_id = b.id
        WHERE uf.user_id = ?
        ORDER BY uf.created_at DESC`,
      [user_id],
    )

    console.log(favorites)

    res.json({ message: 'Success', data: favorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    res.status(500).json({ data: null, message: 'Gagal mengambil data favorit' })
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
    abstrak,
    lokasi,
    status,
    banyak_buku,
  } = req.body

  // Validate required fields
  if (
    !judul ||
    !penulis ||
    !penerbit ||
    !tahun_terbit ||
    !jumlah_halaman ||
    !bahasa ||
    !abstrak ||
    !lokasi ||
    !banyak_buku
  ) {
    return res
      .status(400)
      .json({ message: 'Semua field wajib diisi, kecuali edisi dan gambar!' })
  }

  const picturePath = req.file ? `books/${req.file.filename}` : null

  try {
    await pool.query(`
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
          lokasi,
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
          ${req.body.edisi ? `"${req.body.edisi}"` : 'NULL'},  -- Allow NULL for edisi
          "${abstrak}",
          "${status === 'true' ? 1 : 0}",
          "${+banyak_buku}",
          "${lokasi}",
          ${picturePath ? `"${picturePath}"` : 'NULL'}  -- Allow NULL for gambar
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
    const [rows] = await pool.query(`SELECT * FROM buku WHERE id = ${id}`)
    if (rows.length === 0) {
      return res.status(404).json({
        message: `Buku tidak ada!`,
      })
    }
    return res.status(200).json({ message: 'success', data: rows[0] })
  } catch (error) {
    return res.status(404).json({ message: 'Buku tidak ditemukan' })
  }
}

const remove = async (req, res) => {
  const id = req.params.id

  try {
    const [buku] = await pool.query(`SELECT * FROM buku WHERE id = ${id}`)
    if (buku.length === 0) {
      return res.status(404).json({
        message: 'Buku tidak ditemukan!',
        data: null,
      })
    }

    await pool.query(`DELETE FROM buku WHERE id = ${id}`)
    return res
      .status(200)
      .json({ message: `Berhasil menghapus buku ${buku[0].judul}`, data: buku })
  } catch (error) {
    return res
      .status(404)
      .json({ message: 'Gagal menghapus buku. Error tidak diketahui.' })
  }
}

const update = async (req, res) => {
  const id = req.params.id // ID dari parameter URL
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
    lokasi,
    status,
    banyak_buku,
  } = req.body

  // Validate required fields
  if (
    !judul ||
    !penulis ||
    !penerbit ||
    !tahun_terbit ||
    !jumlah_halaman ||
    !bahasa ||
    !abstrak ||
    !lokasi ||
    !banyak_buku
  ) {
    return res
      .status(400)
      .json({ message: 'Semua field wajib diisi, kecuali edisi dan gambar!' })
  }

  const picturePath = req.file ? `books/${req.file.filename}` : null

  try {
    const [buku] = await pool.query(`SELECT * FROM buku WHERE id = ${id}`)
    if (buku.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Buku dengan id ${id} tidak ditemukan!`,
      })
    }

    // Update data user
    await pool.query(
      `
            UPDATE buku 
            SET 
            judul = ?, 
            penulis = ?, 
            penerbit = ?, 
            tahun_terbit = ?, 
            isbn = ?, 
            jumlah_halaman = ?, 
            bahasa = ?,
            edisi = ?,
            abstrak = ?,
            status = ?,
            banyak_buku = ?,
            lokasi = ?,
            gambar = ?
            WHERE id = ?;
        `,
      [
        judul,
        penulis,
        penerbit,
        +tahun_terbit,
        isbn === 'null' ? buku[0].isbn : isbn,
        +jumlah_halaman,
        bahasa,
        edisi ? edisi : null, // Allow NULL for edisi
        abstrak,
        status === 'true' ? 1 : 0,
        banyak_buku,
        lokasi,
        picturePath ? picturePath : buku[0].gambar,
        +id,
      ],
    )

    return res
      .status(200)
      .json({ message: 'Buku berhasil disunting.', data: null })
  } catch (error) {
    return res
      .status(400)
      .json({ message: 'Gagal menyunting buku', data: error })
  }
}

const addToFavorite = async (req, res) => {
  console.log('tambah favbook')
  const { user_id, book_id } = req.body

  try {
    const [existing] = await pool.query(
      'SELECT * FROM buku_favorit_user WHERE user_id = ? AND buku_id = ?',
      [user_id, book_id],
    )

    console.log(existing)

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ data: null, message: 'Buku sudah ada di daftar favorit' })
    }

    await pool.query(
      'INSERT INTO buku_favorit_user (user_id, buku_id) VALUES (?, ?)',
      [user_id, book_id],
    )

    return res
      .status(200)
      .json({ data: null, message: 'Buku berhasil ditambahkan ke favorit' })
  } catch (error) {
    console.error(error)
    return res
      .status(400)
      .json({ data: null, message: 'Terjadi kesalahan saat menambahkan buku' })
  }
}

const removeFromFavorite = async (req, res) => {
  const { user_id, book_id } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM buku_favorit_user WHERE user_id = ? AND buku_id = ?",
      [user_id, book_id]
    );

    if (existing.length === 0) {
      return res
        .status(400)
        .json({ data: null, message: "Buku tidak ditemukan dalam daftar favorit" });
    }

    await pool.query(
      "DELETE FROM buku_favorit_user WHERE user_id = ? AND buku_id = ?",
      [user_id, book_id]
    );

    return res
      .status(200)
      .json({ data: null, message: "Buku berhasil dihapus dari favorit" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ data: null, message: "Terjadi kesalahan saat menghapus buku" });
  }
};


module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
  addToFavorite,
  getFavorite,
  removeFromFavorite
}
