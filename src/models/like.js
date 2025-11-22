const { query } = require("../utils/database");

const likePost = async (postId, userId) => {
  try {
    const postCheck = await query(
      "SELECT id FROM posts WHERE id = $1 AND is_deleted = FALSE",
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return null;
    }

    const result = await query(
      `INSERT INTO likes (post_id, user_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [postId, userId]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      return null;
    }
    throw error;
  }
};

const unlikePost = async (postId, userId) => {
  const result = await query(
    "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );
  return result.rowCount > 0;
};

const getPostLikes = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT l.*, u.username, u.full_name
     FROM likes l
     JOIN users u ON l.user_id = u.id
     JOIN posts p ON l.post_id = p.id
     WHERE l.post_id = $1 AND p.is_deleted = FALSE
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );
  return result.rows;
};

const getPostLikesCount = async (postId) => {
  const result = await query(
    "SELECT COUNT(*) as count FROM likes WHERE post_id = $1",
    [postId]
  );
  return parseInt(result.rows[0].count);
};

const getUserLikes = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT l.*, p.content, p.media_url, u.username, u.full_name
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE l.user_id = $1 AND p.is_deleted = FALSE
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

const hasUserLikedPost = async (postId, userId) => {
  const result = await query(
    "SELECT id FROM likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );
  return result.rows.length > 0;
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getPostLikesCount,
  getUserLikes,
  hasUserLikedPost,
};
