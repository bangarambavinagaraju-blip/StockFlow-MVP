const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login first."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Convert PostgreSQL BIGINT strings into numbers
        const userId = Number(decoded.userId);
        const organizationId = Number(decoded.organizationId);

        if (
            !Number.isSafeInteger(userId) ||
            userId <= 0 ||
            !Number.isSafeInteger(organizationId) ||
            organizationId <= 0
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        req.user = {
            userId,
            organizationId
        };

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
};

module.exports = authMiddleware;