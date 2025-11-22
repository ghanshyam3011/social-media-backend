const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getFeed } = require("../controllers/feed");

const router = express.Router();

router.get("/", authenticateToken, getFeed);

module.exports = router;
