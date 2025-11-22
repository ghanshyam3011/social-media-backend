const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowingCount,
  getFollowersCount,
} = require("../models/follow");
const { getUserById, searchUsers, getUserProfile, updateUserProfile } = require("../models/user");
const logger = require("../utils/logger");

const follow = async (req, res) => {
  try {
    const { user_id } = req.validatedData;
    const followerId = req.user.id;

    if (followerId === user_id) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const userToFollow = await getUserById(user_id);
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await followUser(followerId, user_id);
    if (!result) {
      return res.status(409).json({ error: "Already following this user" });
    }

    logger.verbose(`user ${followerId} followed user ${user_id}`);
    res.status(201).json({ message: "User followed successfully", follow: result });
  } catch (error) {
    logger.critical("follow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const unfollow = async (req, res) => {
  try {
    const { user_id } = req.params;
    const followerId = req.user.id;

    const userToUnfollow = await getUserById(user_id);
    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const success = await unfollowUser(followerId, user_id);
    if (!success) {
      return res.status(404).json({ error: "Follow relationship not found" });
    }

    logger.verbose(`user ${followerId} unfollowed user ${user_id}`);
    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    logger.critical("unfollow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFollowingList = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const following = await getFollowing(user_id, limit, offset);
    const count = await getFollowingCount(user_id);

    res.json({
      following,
      count,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit && following.length > 0,
      },
    });
  } catch (error) {
    logger.critical("get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFollowersList = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const followers = await getFollowers(user_id, limit, offset);
    const count = await getFollowersCount(user_id);

    res.json({
      followers,
      count,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit && followers.length > 0,
      },
    });
  } catch (error) {
    logger.critical("get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const search = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "search query required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await searchUsers(name.trim(), limit, offset);

    res.json({
      users,
      pagination: {
        page,
        limit,
        hasMore: users.length === limit && users.length > 0,
      },
    });
  } catch (error) {
    logger.critical("user search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const profile = await getUserProfile(user_id);
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ profile });
  } catch (error) {
    logger.critical("get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email } = req.validatedData;

    const updatedUser = await updateUserProfile(userId, { full_name, email });
    if (!updatedUser) {
      return res.status(400).json({ error: "No fields to update" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: "Email already in use" });
    }
    logger.critical("update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { follow, unfollow, getFollowingList, getFollowersList, search, getProfile, updateProfile };
