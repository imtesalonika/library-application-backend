const pool = require('../config/database')
const bcrypt = require('bcrypt')

const create = async (req, res) => {
  const { name, pekerjaan, username, email, password, nomor_telepon } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const [user] = await pool.query(
      `SELECT * FROM users WHERE username = '${username}'`
    )
    if (user.length > 0) {
      return res.status(400).json({
        status: 400,
        data: `User dengan username ${username} sudah terdaftar sebelumnya!`,
      })
    }

    await pool.query(`
            INSERT INTO users (name, pekerjaan, username, email, password, nomor_telepon)
            VALUES ('${name}', '${pekerjaan}', '${username}', '${email}', '${hashedPassword}', '${nomor_telepon}') 
        `)
    return res.status(200).json({ data: `Pendaftaran berhasil!` })
  } catch (error) {
    return res.status(400).json({ message: 'Error creating user' })
  }
}

const getById = async (req, res) => {
  const id = req.params.id

  try {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = "${id}"`)
    if (rows.length === 0) {
      return res.status(404).json({
        message: `User dengan id ${id} tidak ditemukan!`,
        data: null,
      })
    }
    return res.status(200).json({ message: 'ok', data: rows[0] })
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'User tidak ditemukan' })
  }
}

const updateUser = async (req, res) => {
  const { id, name } = req.body

  const picturePath = req.file ? `profile_picture/${req.file.filename}` : null

  try {
    const [user] = await pool.query(`SELECT * FROM users WHERE id = '${id}'`)
    if (user.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `User dengan username ${name} tidak ditemukan!`,
      })
    }

    if (picturePath === null) {
      await pool.query(
        `
      update users
          set name = '${name}'
      where id = '${id}';
    `
      )
    } else {
      await pool.query(
        `
      update users
          set name = '${name}',
          foto_profil = '${picturePath}'
      where id = '${id}';
    `
      )
    }

    return res
      .status(200)
      .json({ message: `Berhasil Memperbarui User ${name}!`, data: user })
  } catch (error) {
    console.error(error)

    if (error.errno === 1064) {
      return res.status(500).json({
        message: `Gagal memperbarui user ${name}. Sintax SQL Error!`,
        data: null,
      })
    }

    return res.status(500).json({
      message: `Gagal memperbarui user ${name}`,
      data: null,
    })
  }
}

module.exports = {
  create,
  getById,
  updateUser,
}
