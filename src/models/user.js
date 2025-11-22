const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const searchUsers = async (searchTerm, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, email, full_name, created_at
     FROM users
     WHERE (username ILIKE $1 OR full_name ILIKE $1) AND is_deleted = FALSE
     ORDER BY username
     LIMIT $2 OFFSET $3`,
    [`%${searchTerm}%`, limit, offset]
  );
  return result.rows;
};

const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT 
      u.id,
      u.username,
      u.email,
      u.full_name,
      u.created_at,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_deleted = FALSE) as posts_count
    FROM users u
    WHERE u.id = $1 AND u.is_deleted = FALSE`,
    [userId]
  );
  return result.rows[0] || null;
};

const updateUserProfile = async (userId, { full_name, email }) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (full_name !== undefined) {
    updates.push(`full_name = $${paramCount}`);
    values.push(full_name);
    paramCount++;
  }

  if (email !== undefined) {
    updates.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }

  if (updates.length === 0) {
    return null;
  }

  updates.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND is_deleted = FALSE
     RETURNING id, username, email, full_name, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  searchUsers,
  getUserProfile,
  updateUserProfile,
};
