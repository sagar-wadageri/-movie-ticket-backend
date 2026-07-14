const UserModel = require('../models/UserModel');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
//const { setCache } = require('../config/redis');
const StatusCodes = require('../utils/statusCodes');
const bcrypt = require('bcryptjs');

// ✅ REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate
        if (!name || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Name, email and password are required'
            });
        }

        // Check if user exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                error: 'User already exists with this email'
            });
        }

        // Create user
        const userId = await UserModel.create({ name, email, password, phone });

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'User registered successfully',
            userId
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Registration failed. Please try again.'
        });
    }
};

// ✅ LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Email and password are required'
            });
        }

        // Get user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Invalid email or password'
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in Redis
       // await setCache(`refresh:${user.id}`, refreshToken, 30 * 24 * 60 * 60);

        return res.status(StatusCodes.OK).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Login failed. Please try again.'
        });
    }
};

// ✅ GET PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'User not found'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to get profile'
        });
    }
};

// ✅ UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const userId = req.user.id;

        if (!name && !phone) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'At least one field is required to update'
            });
        }

        const updated = await UserModel.update(userId, { name, phone });
        if (!updated) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Failed to update profile'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to update profile'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};