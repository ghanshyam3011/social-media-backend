const express = require("express");
const { validateRequest, createPostSchema } = require("../utils/validation");
const {
	create,
	getById,
	getUserPosts,
	getMyPosts,
	remove,
	getScheduled,
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Posts routes
 * IMPORTANT: Specific routes (like /scheduled, /my) MUST come BEFORE /:post_id
 * Otherwise Express will treat "scheduled" as a post ID parameter
 */

// POST /api/posts - Create a new post
router.post("/", authenticateToken, validateRequest(createPostSchema), create);

// GET /api/posts/my - Get current user's posts (BEFORE /:post_id)
router.get("/my", authenticateToken, getMyPosts);

// GET /api/posts/scheduled - Get user's scheduled posts (BEFORE /:post_id)
router.get("/scheduled", authenticateToken, getScheduled);

// GET /api/posts/user/:user_id - Get posts by specific user (BEFORE /:post_id)
router.get("/user/:user_id", optionalAuth, getUserPosts);

// GET /api/posts/:post_id - Get single post by ID (MUST BE LAST)
router.get("/:post_id", optionalAuth, getById);

// DELETE /api/posts/:post_id - Delete a post
router.delete("/:post_id", authenticateToken, remove);

module.exports = router;
