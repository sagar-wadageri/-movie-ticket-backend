const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '30d';

// Generate access token (short-lived)
const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
    );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRE }
    );
};

// Verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};