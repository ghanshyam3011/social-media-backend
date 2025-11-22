const { query } = require("../utils/database");

const createComment = async ({ post_id, user_id, content }) => {
  const result = await query(
    `INSERT INTO comments (post_id, user_id, content, created_at, is_deleted)
     VALUES ($1, $2, $3, NOW(), FALSE)
     RETURNING id, post_id, user_id, content, created_at`,
    [post_id, user_id, content]
  );
  return result.rows[0];
};

const getPostComments = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     JOIN posts p ON c.post_id = p.id
     WHERE c.post_id = $1 AND c.is_deleted = FALSE AND p.is_deleted = FALSE
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );
  return result.rows;
};

const updateComment = async (commentId, userId, content) => {
  const result = await query(
    `UPDATE comments c
     SET content = $1, updated_at = NOW()
     FROM posts p
     WHERE c.id = $2 AND c.user_id = $3 AND c.is_deleted = FALSE
       AND c.post_id = p.id AND p.is_deleted = FALSE
     RETURNING c.*`,
    [content, commentId, userId]
  );
  return result.rows[0];
};

const deleteComment = async (commentId, userId) => {
  const result = await query(
    "UPDATE comments SET is_deleted = TRUE WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE",
    [commentId, userId]
  );
  return result.rowCount > 0;
};

const getCommentById = async (commentId) => {
  const result = await query(
    `SELECT c.* FROM comments c
     JOIN posts p ON c.post_id = p.id
     WHERE c.id = $1 AND c.is_deleted = FALSE AND p.is_deleted = FALSE`,
    [commentId]
  );
  return result.rows[0];
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  getCommentById,
};
