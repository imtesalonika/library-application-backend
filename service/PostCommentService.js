const pool = require("../config/database");

const addComment = async (req, res) => {
  const { post_id, user_id, content } = req.body;

  if (!post_id || !user_id || !content) {
    return res.status(400).json({
      message: "Semua field (post_id, user_id, content) harus diisi.",
    });
  }

  try {
    const query = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES (?, ?, ?);
    `;
    const [result] = await pool.query(query, [post_id, user_id, content]);

    return res.status(201).json({
      message: "Komentar berhasil ditambahkan.",
      comment: {
        id: result.insertId,
        post_id,
        user_id,
        content,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Kesalahan saat menambahkan komentar:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan komentar.",
      error: error.message,
    });
  }
};
module.exports = { addComment };
