const { query } = require("../utils/database");

const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    return null;
  }
  
  try {
    const result = await query(
      `INSERT INTO follows (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, follower_id, following_id, created_at`,
      [followerId, followingId]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      return null;
    }
    throw error;
  }
};

const unfollowUser = async (followerId, followingId) => {
  const result = await query(
    "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );
  return result.rowCount > 0;
};

const getFollowing = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT f.*, u.username, u.full_name, u.created_at as user_created_at
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1 AND u.is_deleted = FALSE
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

const getFollowers = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT f.*, u.username, u.full_name, u.created_at as user_created_at
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1 AND u.is_deleted = FALSE
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

const getFollowingCount = async (userId) => {
  const result = await query(
    "SELECT COUNT(*) as count FROM follows WHERE follower_id = $1",
    [userId]
  );
  return parseInt(result.rows[0].count);
};

const getFollowersCount = async (userId) => {
  const result = await query(
    "SELECT COUNT(*) as count FROM follows WHERE following_id = $1",
    [userId]
  );
  return parseInt(result.rows[0].count);
};

const isFollowing = async (followerId, followingId) => {
  const result = await query(
    "SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );
  return result.rows.length > 0;
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowingCount,
  getFollowersCount,
  isFollowing,
};
