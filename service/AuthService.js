const jwt = require('jsonwebtoken')
const pool = require('../config/database')
require('dotenv').config()

const generateToken = (username, ip) => {
  return jwt.sign({ username, ip }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const login = async (req, res) => {
  const { username, password } = req.body

  try {
    // const agent = new https.Agent({ rejectUnauthorized: false }) // Abaikan SSL hanya saat debugging

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

    console.log(rows)

    if (rows.length === 0) {
      data.is_complete = false
      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mengambil data',
        data,
      })
    } else {
      data.is_complete = true
      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mengambil data',
        data,
      })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Terjadi kesalahan saat login.' })
  }
}

module.exports = {
  login,
}
