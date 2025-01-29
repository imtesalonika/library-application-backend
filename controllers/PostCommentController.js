const express = require("express");
const authMiddleware = require("../middleware/AuthMiddleware");
const { addComment } = require("../service/PostCommentService");
const router = express.Router();

router.post("/", authMiddleware, addComment);

module.exports = router;
