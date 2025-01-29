const pool = require("../config/database");

const like = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    // Periksa apakah pengguna sudah memberi like
    const [existingLike] = await pool.query(
      `SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId],
    );

    if (existingLike.length > 0) {
      await pool.query(
        `DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`,
        [postId, userId],
      );
    } else {
      await pool.query(
        `INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`,
        [postId, userId],
      );
    }

    return res.status(200).json({ message: "Like berhasil ditambahkan!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal menambahkan like." });
  }
};
module.exports = { like };
