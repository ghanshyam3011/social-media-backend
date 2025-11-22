
const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
  scheduled_at = null,
}) => {
  let status = 'published';
  
  if (scheduled_at) {
    const scheduledDate = new Date(scheduled_at);
    const now = new Date();
    
    if (scheduledDate <= now) {
      throw new Error('Scheduled time must be in the future');
    }
    
    status = 'scheduled';
  }

  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, scheduled_at, status, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), FALSE)
     RETURNING id, user_id, content, media_url, comments_enabled, scheduled_at, status, created_at`,
    [user_id, content, media_url, comments_enabled, scheduled_at, status],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = FALSE AND p.status = 'published'`,
    [postId],
  );

  return result.rows[0] || null;
};

const getPostByIdWithDetails = async (postId, userId = null) => {
  const params = [postId];
  let likedByYouQuery = 'FALSE as liked_by_you';
  
  if (userId) {
    params.push(userId);
    likedByYouQuery = 'EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) as liked_by_you';
  }

  const result = await query(
    `SELECT 
      p.*,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes l 
       JOIN users lu ON l.user_id = lu.id 
       WHERE l.post_id = p.id AND lu.is_deleted = FALSE) as likes_count,
      (SELECT COUNT(*) FROM comments c 
       JOIN users cu ON c.user_id = cu.id 
       WHERE c.post_id = p.id AND c.is_deleted = FALSE AND cu.is_deleted = FALSE) as comments_count,
      ${likedByYouQuery}
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1 AND p.is_deleted = FALSE AND p.status = 'published'`,
    params
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_deleted = FALSE AND p.status = 'published'
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = TRUE WHERE id = $1 AND user_id = $2",
    [postId, userId],
  );

  return result.rowCount > 0;
};

// TODO: Implement getFeedPosts function that returns posts from followed users
// This should include pagination and ordering by creation date

// TODO: Implement updatePost function for editing posts

// TODO: Implement searchPosts function for content search

/**
 * Get scheduled posts that are ready to be published
 * @returns {Promise<Array>} Array of posts ready to publish
 */
const getScheduledPosts = async () => {
  const result = await query(
    `SELECT * FROM posts
     WHERE status = 'scheduled' 
     AND scheduled_at <= NOW()
     AND is_deleted = FALSE`,
    []
  );

  return result.rows;
};

/**
 * Publish a scheduled post
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Success status
 */
const publishScheduledPost = async (postId) => {
  const result = await query(
    `UPDATE posts 
     SET status = 'published'
     WHERE id = $1`,
    [postId]
  );

  return result.rowCount > 0;
};

/**
 * Get scheduled posts by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of scheduled posts
 */
const getMyScheduledPosts = async (userId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.status = 'scheduled' AND p.is_deleted = FALSE
     ORDER BY p.scheduled_at ASC`,
    [userId]
  );

  return result.rows;
};

module.exports = {
  createPost,
  getPostById,
  getPostByIdWithDetails,
  getPostsByUserId,
  deletePost,
  getScheduledPosts,
  publishScheduledPost,
  getMyScheduledPosts,
};
