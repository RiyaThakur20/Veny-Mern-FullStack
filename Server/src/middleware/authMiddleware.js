const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes from unauthorized access
 * Ensures the user is logged in and the token is valid
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Authorization header format check: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Fetch user and exclude sensitive fields
            // We exclude password, otp, and otpExpires for safety
            req.user = await User.findById(decoded.id).select('-password -otp -otpExpires');

            if (!req.user) {
                return res.status(401).json({ success: false, msg: "User no longer exists" });
            }

            next(); 

        } catch (error) {
            // Check specifically if the error is due to token expiration
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, msg: "Session expired. Please login again." });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ success: false, msg: "Invalid token. Access denied." });
            }
            next(error); 
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, msg: "No token provided, access denied" });
    }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 * Limits access based on user roles (e.g., admin, seller, user)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // If user's role is not included in the allowed roles array
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                msg: `Access denied. Role '${req.user?.role || 'unknown'}' does not have permission.`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };