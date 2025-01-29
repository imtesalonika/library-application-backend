const pool = require("../config/database");

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Gagal untuk mendapatkan produk!" });
  }
};

const getAllUploadedByMe = async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM products where uploader_id='${id}'`,
    );
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Gagal untuk mendapatkan produk!" });
  }
};

const create = async (req, res) => {
  const { nama, description, harga, lokasi, whatsapp_number, uploader_id } =
    req.body;

  const picturePath = req.file ? `products/${req.file.filename}` : null;

  try {
    const [rows] = await pool.query(`
            INSERT INTO products (
                nama,
                picture,
                description,
                harga,
                lokasi,
                whatsapp_number,
                uploader_id
                )
            VALUES (
                '${nama}', 
                '${picturePath}', 
                '${description}', 
                '${harga}', 
                '${lokasi}', 
                '${whatsapp_number}',
                '${uploader_id}'
                ) 
        `);
    return res.status(200).json({ data: `Product ${nama} berhasil dibuat!` });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Gagal membuat produk!" });
  }
};

const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(`SELECT * FROM products WHERE id = ${id}`);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Produk tidak ada!`,
      });
    }
    return res.status(200).json({ status: "ok", data: rows });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }
};

const remove = async (req, res) => {
  const id = req.params.id;

  try {
    const [product] = await pool.query(
      `SELECT * FROM products WHERE id = ${id}`,
    );
    if (product.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `Produk tidak ditemukan!`,
      });
    }

    await pool.query(`DELETE FROM products WHERE id = ${id}`);
    return res.status(200).json({ status: "ok", data: product });
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ message: "Gagal menghapus user. Error tidak diketahui." });
  }
};

const update = async (req, res) => {
  const id = req.params.id; // ID dari parameter URL
  const { name, pekerjaan, username, email, password, saldo } = req.body; // Data dari body request

  try {
    const [user] = await pool.query(`SELECT * FROM users WHERE id = ${id}`);
    if (user.length === 0) {
      return res.status(404).json({
        status: 404,
        data: `User dengan id ${id} tidak ditemukan!`,
      });
    }

    let hashedPassword = user[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update data user
    await pool.query(
      `
            UPDATE users 
            SET name = ?, pekerjaan = ?, username = ?, email = ?, password = ?, saldo = ?, updatedAt = NOW()
            WHERE id = ?;
        `,
      [name, pekerjaan, username, email, hashedPassword, saldo, id],
    );

    return res
      .status(200)
      .json({ status: "ok", message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error updating user", error });
  }
};

module.exports = {
  getAll,
  create,
  getById,
  remove,
  update,
  getAllUploadedByMe,
};
