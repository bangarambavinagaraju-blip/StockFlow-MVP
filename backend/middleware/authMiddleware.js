// ==========================================
// STOCKFLOW - JWT AUTHENTICATION MIDDLEWARE
// ==========================================

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {

        // Get authorization header
        const authHeader = req.headers.authorization;

        // Check whether token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login first."
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach authenticated user information
        req.user = {
            userId: decoded.userId,
            organizationId: decoded.organizationId
        };

        // Continue to protected route
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