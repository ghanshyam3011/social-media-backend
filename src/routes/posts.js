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
 * IMPORTANT: Specific routes (like /scheduled, /my) must come BEFORE /:post_id
 */

//  create a new post
router.post("/", authenticateToken, validateRequest(createPostSchema), create);

// get user's posts
router.get("/my", authenticateToken, getMyPosts);


//  BONUS :)
// get user's scheduled posts
router.get("/scheduled", authenticateToken, getScheduled);

// get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPosts);

// get a single post by ID
router.get("/:post_id", optionalAuth, getById);


// delete a post
router.delete("/:post_id", authenticateToken, remove);

module.exports = router;
