const pool = require('../config/database')
require('dotenv').config()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const login = async (req, res) => {
  const { username, password } = req.body

  try {
    const formdata = new URLSearchParams()
    formdata.append('username', username)
    formdata.append('password', password)

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    }

    const response = await fetch(
      'https://103.167.217.134/api/jwt-api/do-auth',
      requestOptions
    )

    let data = await response.json()

    if (!data.result) {
      return res
        .status(401)
        .json({ message: 'Login gagal. Periksa kembali kredensial Anda.' })
    }

    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id = ${data.user.user_id}`
    )

    if (data.user.role === 'Mahasiswa') {
      if (rows.length === 0) {
        data.is_complete = false

        await pool.query(
          `INSERT INTO users (id, username, email, role, status, jabatan) 
            VALUES (?, ?, ?, ?, ?, ?);`,
          [
            data.user.user_id,
            data.user.username,
            data.user.email,
            data.user.role,
            data.user.status,
            data.user.jabatan,
          ]
        )
        return res.status(200).json({
          message: 'Berhasil mengambil data',
          data: data,
        })
      } else {
        if (rows[0].name) {
          data.is_complete = true
          delete data.user

          data.user = rows[0]

          return res.status(200).json({
            message: 'Berhasil mengambil data',
            data: data,
          })
        } else {
          data.is_complete = false
          return res.status(200).json({
            message: 'Berhasil mengambil data',
            data: data,
          })
        }
      }
    } else {
      return res.status(400).json({
        message: 'Login gagal. Akun anda tidak diizinkan login.',
        data: null,
      })
    }
  } catch (error) {
    console.log(error)

    return res.status(500).json({ message: 'Terjadi kesalahan saat login.' })
  }
}

const completeData = async (req, res) => {
  const { user_id, name } = req.body

  try {
    await pool.query(
      `UPDATE users 
       SET name = ?
       WHERE id = ?;`,
      [name, user_id]
    )

    const [row] = await pool.query(`SELECT * FROM users WHERE id=${user_id};`)

    return res.status(200).json({
      message: 'Berhasil menambahkan nama.',
      data: row,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat login.', data: null })
  }
}

module.exports = {
  login,
  completeData,
}
