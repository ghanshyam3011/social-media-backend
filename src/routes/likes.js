const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { like, unlike, getPostLikesWithCount, getUserLikedPosts } = require("../controllers/likes");
const Joi = require("joi");
const { validateRequest } = require("../utils/validation");

const router = express.Router();

const likeSchema = Joi.object({
  post_id: Joi.number().integer().required(),
});

router.post("/", authenticateToken, validateRequest(likeSchema), like);
router.delete("/:post_id", authenticateToken, unlike);
router.get("/post/:post_id", getPostLikesWithCount);
router.get("/user/:user_id", getUserLikedPosts);

module.exports = router;
