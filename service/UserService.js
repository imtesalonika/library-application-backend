const pool = require("../config/database");
const bcrypt = require("bcrypt");

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Gagal untuk mendapatkan users!" });
  }
};

const create = async (req, res) => {
  const { name, pekerjaan, username, email, password, nomor_telepon } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [user] = await pool.query(
      `SELECT * FROM users WHERE username = '${username}'`,
    );
    if (user.length > 0) {
      return res.status(400).json({
        status: 400,
        data: `User dengan username ${username} sudah terdaftar sebelumnya!`,
      });
    }

    const [rows] = await pool.query(`
            INSERT INTO users (name, pekerjaan, username, email, password, nomor_telepon)
            VALUES ('${name}', '${pekerjaan}', '${username}', '${email}', '${hashedPassword}', '${nomor_telepon}') 
        `);
    return res.status(200).json({ data: `Pendaftaran berhasil!` });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error creating user" });
  }
};

const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE username = "${id}"`,
    );
    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `User dengan id ${id} tidak ditemukan!`,
      });
    }
    return res.status(200).json({ status: "ok", data: rows });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
};

// Fungsi untuk menghapus user berdasarkan ID
const removeUser = async (req, res) => {
  const id = req.params.id;

  try {
    const [user] = await pool.query(`SELECT * FROM users WHERE id = ${id}`);
    if (user.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `User dengan id ${id} tidak ditemukan!`,
      });
    }

    await pool.query(`DELETE FROM users WHERE id = ${id}`);
    return res.status(200).json({ status: "ok", data: user });
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ message: "Gagal menghapus user. Error tidak diketahui." });
  }
};

const updateUser = async (req, res) => {
  const { name, pekerjaan, nomor_telepon, username, email, current_username } =
    req.body;

  const picturePath = req.file ? `profile_picture/${req.file.filename}` : null;

  try {
    const [user] = await pool.query(
      `SELECT * FROM users WHERE username = '${current_username}'`,
    );
    if (user.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `User dengan username ${current_username} tidak ditemukan!`,
      });
    }

    if (picturePath != null) {
      await pool.query(
        `
      update users
          set username = '${username}',
              email = '${email}',
              name = '${name}',
              nomor_telepon = '${nomor_telepon}',
              pekerjaan = '${pekerjaan}',
              foto_profil = '${picturePath}'
      where username = '${username}';
    `,
      );
    } else {
      await pool.query(
        `
      update users
          set username = '${username}',
              email = '${email}',
              name = '${name}',
              nomor_telepon = '${nomor_telepon}',
              pekerjaan = '${pekerjaan}'
      where username = '${current_username}';
    `,
      );
    }

    return res
      .status(200)
      .json({ status: "ok", data: `Berhasil Memperbarui User ${username}!` });
  } catch (error) {
    console.error(error);

    if (error.errno === 1062) {
      return res.status(500).json({
        status: "error",
        data: `Gagal memperbarui user dengan username ${username}. Username sudah ada sebelumnya!`,
        error,
      });
    }

    if (error.errno === 1064) {
      return res.status(500).json({
        status: "error",
        data: `Gagal memperbarui user ${username}. Sintax SQL Error!`,
        error,
      });
    }

    return res.status(500).json({
      status: "error",
      data: `Gagal memperbarui user ${username}`,
      error,
    });
  }
};

module.exports = {
  getAll,
  create,
  getById,
  removeUser,
  updateUser,
};
