const {
  createPost,
  getPostById,
  getPostByIdWithDetails,
  getPostsByUserId,
  deletePost,
  updatePost,
  searchPosts,
  getMyScheduledPosts,
} = require("../models/post.js");
const { getUserById } = require("../models/user.js");
const logger = require("../utils/logger");

/**
 * Create a new post
 */
const create = async (req, res) => {
  try {
    const { content, media_url, comments_enabled, scheduled_at } = req.validatedData;
    const userId = req.user.id;

    const post = await createPost({
      user_id: userId,
      content,
      media_url,
      comments_enabled,
      scheduled_at,
    });

    logger.verbose(`User ${userId} created post ${post.id}`);

    res.status(201).json({
      message: post.status === 'scheduled' ? "Post scheduled successfully" : "Post created successfully",
      post,
    });
  } catch (error) {
    logger.critical("Create post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single post by ID
 */
const getById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user?.id || null;

    const post = await getPostByIdWithDetails(parseInt(post_id), userId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    logger.critical("Get post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts by a specific user
 */
const getUserPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await getUserById(parseInt(user_id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await getPostsByUserId(parseInt(user_id), limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit && posts.length > 0,
      },
    });
  } catch (error) {
    logger.critical("Get user posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user's posts
 */
const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit && posts.length > 0,
      },
    });
  } catch (error) {
    logger.critical("Get my posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a post
 */
const remove = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await deletePost(parseInt(post_id), userId);

    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted post ${post_id}`);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.critical("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a post
 */
const update = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;
    const { content, media_url, comments_enabled } = req.body;

    const post = await updatePost(parseInt(post_id), userId, {
      content,
      media_url,
      comments_enabled,
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} updated post ${post_id}`);

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    logger.critical("Update post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Search posts by content
 */
const search = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const posts = await searchPosts(q.trim(), limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        query: q,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Search posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user's scheduled posts
 */
const getScheduled = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await getMyScheduledPosts(userId);

    res.json({
      posts,
      count: posts.length,
    });
  } catch (error) {
    logger.critical("Get scheduled posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  getById,
  getUserPosts,
  getMyPosts,
  remove,
  update,
  search,
  getScheduled,
};
