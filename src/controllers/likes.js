const {
  likePost,
  unlikePost,
  getPostLikes,
  getPostLikesCount,
  getUserLikes,
  hasUserLikedPost,
} = require("../models/like");
const { getPostById } = require("../models/post");
const logger = require("../utils/logger");

const like = async (req, res) => {
  try {
    const { post_id } = req.validatedData;
    const userId = req.user.id;

    const post = await getPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.status && post.status !== 'published') {
      return res.status(400).json({ error: "Post not published yet" });
    }

    const result = await likePost(post_id, userId);
    if (!result) {
      return res.status(409).json({ error: "Post already liked" });
    }

    logger.verbose(`user ${userId} liked post ${post_id}`);
    res.status(201).json({ message: "Post liked successfully", like: result });
  } catch (error) {
    logger.critical("like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const unlike = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await unlikePost(post_id, userId);
    if (!success) {
      return res.status(404).json({ error: "Like not found" });
    }

    logger.verbose(`user ${userId} unliked post ${post_id}`);
    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    logger.critical("unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPostLikesWithCount = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const likes = await getPostLikes(post_id, limit, offset);
    const count = await getPostLikesCount(post_id);

    res.json({
      likes,
      count,
      pagination: {
        page,
        limit,
        hasMore: likes.length === limit && likes.length > 0,
      },
    });
  } catch (error) {
    logger.critical("get post likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserLikedPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const likes = await getUserLikes(user_id, limit, offset);

    res.json({
      likes,
      pagination: {
        page,
        limit,
        hasMore: likes.length === limit && likes.length > 0,
      },
    });
  } catch (error) {
    logger.critical("get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { like, unlike, getPostLikesWithCount, getUserLikedPosts };
