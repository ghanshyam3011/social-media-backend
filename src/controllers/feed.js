const { getFeedPosts } = require("../models/feed");
const logger = require("../utils/logger");

const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getFeedPosts(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit && posts.length > 0,
      },
    });
  } catch (error) {
    logger.critical("get feed error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getFeed };
