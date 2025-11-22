const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { follow, unfollow, getFollowingList, getFollowersList, search, getProfile, updateProfile } = require("../controllers/users");
const Joi = require("joi");
const { validateRequest } = require("../utils/validation");

const router = express.Router();

const followSchema = Joi.object({
  user_id: Joi.number().integer().required(),
});

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
});

router.get("/search", search);
router.get("/profile/:user_id", getProfile);
router.put("/profile", authenticateToken, validateRequest(updateProfileSchema), updateProfile);
router.post("/follow", authenticateToken, validateRequest(followSchema), follow);
router.delete("/follow/:user_id", authenticateToken, unfollow);
router.get("/following/:user_id", getFollowingList);
router.get("/followers/:user_id", getFollowersList);

module.exports = router;
