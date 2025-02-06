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
    return res
      .status(400)
      .json({ message: 'Gagal untuk mendapatkan buku!', data: null })
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
          "${picturePath ? picturePath : null}"
          ) 
    `)

    return res.status(200).json({ data: `Buku berhasil ditambahkan!` })
  } catch (error) {
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
    status,
    banyak_buku,
  } = req.body

  const picturePath = req.file ? `books/${req.file.filename}` : null

  try {
    const [buku] = await pool.query(`SELECT * FROM buku WHERE id = ${id}`)
    if (buku.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Buku dengan id ${id} tidak ditemukan!`,
      })
    }

    console.log(buku)

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
            gambar = ?
            WHERE id = ?;
        `,
      [
        !judul ? buku[0].judul : judul,
        !penulis ? buku[0].penulis : penulis,
        !penerbit ? buku[0].penerbit : penerbit,
        !tahun_terbit ? buku[0].tahun_terbit : +tahun_terbit,
        !isbn ? buku[0].isbn : isbn,
        !jumlah_halaman ? buku[0].jumlah_halaman : +jumlah_halaman,
        !bahasa ? buku[0].bahasa : bahasa,
        !edisi ? buku[0].edisi : edisi,
        !abstrak ? buku[0].abstrak : abstrak,
        !status ? buku[0].status : status === 'true' ? 1 : 0,
        !banyak_buku ? buku[0].banyak_buku : banyak_buku,
        picturePath ? picturePath : buku[0].gambar,
        +id,
      ]
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

module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
}
