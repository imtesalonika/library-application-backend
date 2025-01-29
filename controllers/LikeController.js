const express = require("express");
const authMiddleware = require("../middleware/AuthMiddleware");
const { like } = require("../service/LikeService");
const router = express.Router();

router.post("/", authMiddleware, like);

module.exports = router;
