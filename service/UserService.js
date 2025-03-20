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

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM users;`)
    if (rows.length === 0) {
      return res.status(404).json({
        message: `Tidak ada user!`,
        data: null,
      })
    }
    return res.status(200).json({ message: 'ok', data: rows })
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'User tidak ditemukan' })
  }
}

const updateUser = async (req, res) => {
  const { id, name } = req.body;

  // ✅ Validasi nama hanya boleh huruf (a-z, A-Z) menggunakan regex
  if (!/^[a-zA-Z]+$/.test(name)) {
    return res.status(400).json({
      status: 400,
      message: 'Nama hanya boleh terdiri dari huruf a-z dan A-Z!',
    });
  }

  const picturePath = req.file ? `profile_picture/${req.file.filename}` : null;

  try {
    const [user] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (user.length === 0) {
      return res.status(404).json({
        status: 404,
        message: `User dengan ID ${id} tidak ditemukan!`,
      });
    }

    if (picturePath === null) {
      await pool.query(
        `
            UPDATE users
            SET name = ?
            WHERE id = ?;
        `,
        [name, id]
      );
    } else {
      await pool.query(
        `
            UPDATE users
            SET name = ?,
                foto_profil = ?
            WHERE id = ?;
        `,
        [name, picturePath, id]
      );
    }

    return res.status(200).json({
      message: `Berhasil memperbarui user ${name}!`,
      data: user,
    });
  } catch (error) {
    console.error(error);

    if (error.errno === 1064) {
      return res.status(500).json({
        message: `Gagal memperbarui user ${name}. Sintaks SQL Error!`,
        data: null,
      });
    }

    return res.status(500).json({
      message: `Gagal memperbarui user ${name}`,
      data: null,
    });
  }
};

const deleteProfilePict =  async (req, res) => {
  const { id } = req.body;
  const [user] = await pool.query(`SELECT * FROM users WHERE id = '${id}'`)

  await pool.query(
    `
      update users
          set  foto_profil = null
      where id = '${id}';
    `)

  return res.status(200).json({ message: 'Berhasil menghapus foto profil.', data: user })
}

module.exports = {
  create,
  getById,
  updateUser,
  getAll,
  deleteProfilePict
}
