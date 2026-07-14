const { verifyToken } = require('../config/jwt');
const UserModel = require('../models/UserModel');
const StatusCodes = require('../utils/statusCodes');

// ✅ Authenticate - verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Invalid or expired token.'
            });
        }

        // Get user from database
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Authentication failed.'
        });
    }
};

// ✅ Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(StatusCodes.FORBIDDEN).json({
            error: 'Access denied. Admin only.'
        });
    }
    next();
};

// ✅ Optional authentication (for public routes with optional user)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = verifyToken(token);
            
            if (decoded) {
                const user = await UserModel.findById(decoded.id);
                if (user) {
                    req.user = user;
                }
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    authenticate,
    isAdmin,
    optionalAuth
};