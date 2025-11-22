const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  getCommentById,
} = require("../models/comment");
const { getPostById } = require("../models/post");
const logger = require("../utils/logger");

const create = async (req, res) => {
  try {
    const { post_id, content } = req.validatedData;
    const userId = req.user.id;

    const post = await getPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.status && post.status !== 'published') {
      return res.status(400).json({ error: "Post not published yet" });
    }

    if (!post.comments_enabled) {
      return res.status(403).json({ error: "Comments disabled for this post" });
    }

    const comment = await createComment({ post_id, user_id: userId, content });
    logger.verbose(`user ${userId} commented on post ${post_id}`);

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    logger.critical("create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const comments = await getPostComments(post_id, limit, offset);

    res.json({
      comments,
      pagination: { 
        page, 
        limit, 
        hasMore: comments.length === limit && comments.length > 0 
      },
    });
  } catch (error) {
    logger.critical("get comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.validatedData;
    const userId = req.user.id;

    const existingComment = await getCommentById(comment_id);
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found or unauthorized" });
    }

    const post = await getPostById(existingComment.post_id);
    if (!post || !post.comments_enabled) {
      return res.status(403).json({ error: "Comments disabled for this post" });
    }

    const comment = await updateComment(comment_id, userId, content);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found or unauthorized" });
    }

    res.json({ message: "Comment updated successfully", comment });
  } catch (error) {
    logger.critical("update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const userId = req.user.id;

    const success = await deleteComment(comment_id, userId);
    if (!success) {
      return res.status(404).json({ error: "Comment not found or unauthorized" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.critical("delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { create, getComments, update, remove };
