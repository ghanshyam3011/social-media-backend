const { query } = require("../utils/database");

const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT 
      p.id,
      p.user_id,
      p.content,
      p.media_url,
      p.comments_enabled,
      p.created_at,
      p.updated_at,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes l 
       JOIN users lu ON l.user_id = lu.id 
       WHERE l.post_id = p.id AND lu.is_deleted = FALSE) as likes_count,
      (SELECT COUNT(*) FROM comments c 
       JOIN users cu ON c.user_id = cu.id 
       WHERE c.post_id = p.id AND c.is_deleted = FALSE AND cu.is_deleted = FALSE) as comments_count,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked_by_you
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.is_deleted = FALSE 
      AND u.is_deleted = FALSE
      AND p.status = 'published'
      AND (
        p.user_id = $1 
        OR p.user_id IN (
          SELECT following_id FROM follows WHERE follower_id = $1
        )
      )
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

module.exports = {
  getFeedPosts,
};
