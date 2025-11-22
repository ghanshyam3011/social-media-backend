const { getScheduledPosts, publishScheduledPost } = require("../models/post");
const logger = require("../utils/logger");

/**
 * Scheduler service to publish scheduled posts
 */

let schedulerInterval = null;

/**
 * Check and publish scheduled posts that are due
 */
const checkAndPublishScheduledPosts = async () => {
  try {
    const postsToPublish = await getScheduledPosts();

    if (postsToPublish.length > 0) {
      logger.verbose(`Found ${postsToPublish.length} scheduled posts ready to publish`);

      for (const post of postsToPublish) {
        const success = await publishScheduledPost(post.id);
        if (success) {
          logger.verbose(`Published scheduled post ${post.id}`);
        } else {
          logger.critical(`Failed to publish scheduled post ${post.id}`);
        }
      }
    }
  } catch (error) {
    logger.critical("Error in scheduled posts checker:", error);
  }
};

/**
 * Start the scheduler
 * @param {number} intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
 */
const startScheduler = (intervalMs = 60000) => {
  if (schedulerInterval) {
    logger.verbose("Scheduler already running");
    return;
  }

  logger.verbose(`Starting scheduler with interval ${intervalMs}ms`);
  
  // Run immediately on start
  checkAndPublishScheduledPosts();
  
  // Then run at intervals
  schedulerInterval = setInterval(checkAndPublishScheduledPosts, intervalMs);
};

/**
 * Stop the scheduler
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.verbose("Scheduler stopped");
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  checkAndPublishScheduledPosts,
};
