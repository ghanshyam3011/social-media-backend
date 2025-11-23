const { verifyToken } = require("../utils/jwt");
const { getUserById } = require("../models/user");
const logger = require("../utils/logger");


const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) { //Bug#5: check before using
            return res.status(401).json({ error: "Access token required" });
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        
        const decoded = verifyToken(token);

        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.critical("Authentication error:", error.message);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];

		if (authHeader) {
			// Extract token from "Bearer <token>" format
			const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
			const decoded = verifyToken(token);
			const user = await getUserById(decoded.userId);
			if (user) {
				req.user = user;
			}
		}

		next();
	} catch (error) {
		// Ignore auth errors for optional auth
		next();
	}
};

module.exports = {
	authenticateToken,
	optionalAuth,
};
