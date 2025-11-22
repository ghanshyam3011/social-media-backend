const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { create, getComments, update, remove } = require("../controllers/comments");
const Joi = require("joi");
const { validateRequest } = require("../utils/validation");

const router = express.Router();

const commentSchema = Joi.object({
  post_id: Joi.number().integer().required(),
  content: Joi.string().min(1).max(500).required(),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});

router.post("/", authenticateToken, validateRequest(commentSchema), create);
router.get("/post/:post_id", getComments);
router.put("/:comment_id", authenticateToken, validateRequest(updateCommentSchema), update);
router.delete("/:comment_id", authenticateToken, remove);

module.exports = router;
