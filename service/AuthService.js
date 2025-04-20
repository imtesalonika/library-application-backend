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

    if (username === '' || username == null) {
      return res
        .status(401)
        .json({ message: 'Username tidak boleh kosong!' })

    }

    if (password === '' || password == null) {
      return res
        .status(401)
        .json({ message: 'Password tidak boleh kosong!' })

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

    if (data.user.role === 'Staff') {
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
            data.user.jabatan.length > 0 ? [data.user.jabatan[0].jabatan] : '-',
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
      if (
        data.user.role === 'Mahasiswa' &&
        (username === 'ifs21005' ||
          username === 'ifs21049' ||
          username === 'ifs21055')
      ) {
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
              data.user.jabatan.length > 0
                ? [data.user.jabatan[0].jabatan]
                : '-',
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
      }

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
  console.log('Tesa Log : Ada request complete data')

  const { user_id, name, fcm_token } = req.body

  console.log(req.body)

  try {
    await pool.query(
      `UPDATE users 
       SET name = ?, fcm_token = ?
       WHERE id = ?;`,
      [name, fcm_token, user_id]
    )

    const [row] = await pool.query(`SELECT * FROM users WHERE id=${user_id};`)

    return res.status(200).json({
      message: 'Berhasil menambahkan nama',
      data: row,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat menyimpan data.', data: null })
  }
}

const loginMobile = async (req, res) => {
  console.log('Tesa Log : Ada request login dari mobile.')

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
          data.user.jabatan.length > 0 ? [data.user.jabatan[0].jabatan] : '-',
        ]
      )
      return res.status(200).json({
        message:
          'Login berhasil. Tapi kamu perlu melengkapi nama kamu terlebih dahulu.',
        data: data,
      })
    } else {
      if (rows[0].name) {
        data.is_complete = true
        delete data.user
        data.user = rows[0]

        return res.status(200).json({
          message: 'Login berhasil.',
          data: data,
        })
      } else {
        data.is_complete = false
        return res.status(200).json({
          message:
            'Login berhasil. Tapi kamu perlu melengkapi nama kamu terlebih dahulu.',
          data: data,
        })
      }
    }
  } catch (error) {
    console.log(error)

    return res
      .status(500)
      .json({ message: 'Login gagal. Terjadi kesalahan saat login.' })
  }
}

const visit = async (req, res) => {
  try {
    await pool.query(`INSERT INTO visitor_logs (visit_time) VALUES (NOW());`)

    return res.status(200).json({
      message: 'Log berhasil dicatat.',
      data: null,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat mencatat log.', data: null })
  }
}

const getTotalVisit = async (req, res) => {
  try {
    const [row] = await pool.query(
      `SELECT * FROM visitor_logs 
        WHERE DATE(visit_time) = CURDATE();`
    )

    return res.status(200).json({
      message: 'Success',
      data: row,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat mengambil data.', data: null })
  }
}

module.exports = {
  login,
  completeData,
  loginMobile,
  visit,
  getTotalVisit,
}
