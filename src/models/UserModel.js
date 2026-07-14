const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    // Find user by email
    static async findByEmail(email) {
        try {
            const users = await query(
                'SELECT id, email, password_hash, name, phone, role, is_verified FROM users WHERE email = ?',
                [email]
            );
            return users[0] || null;
        } catch (error) {
            console.error('UserModel.findByEmail error:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const users = await query(
                'SELECT id, email, name, phone, role FROM users WHERE id = ?',
                [id]
            );
            return users[0] || null;
        } catch (error) {
            console.error('UserModel.findById error:', error);
            throw error;
        }
    }

    // Create new user
    static async create(userData) {
        try {
            const { name, email, password, phone } = userData;
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const result = await query(
                `INSERT INTO users (name, email, password_hash, phone) 
                 VALUES (?, ?, ?, ?)`,
                [name, email, passwordHash, phone]
            );

            return result.insertId;
        } catch (error) {
            console.error('UserModel.create error:', error);
            throw error;
        }
    }

    // Update user
    static async update(id, userData) {
        try {
            const { name, phone } = userData;
            
            const result = await query(
                `UPDATE users SET name = ?, phone = ? WHERE id = ?`,
                [name, phone, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('UserModel.update error:', error);
            throw error;
        }
    }

    // Check if user exists
    static async exists(email) {
        try {
            const users = await query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            return users.length > 0;
        } catch (error) {
            console.error('UserModel.exists error:', error);
            throw error;
        }
    }

    // Verify user email
    static async verifyUser(email) {
        try {
            const result = await query(
                `UPDATE users SET is_verified = true WHERE email = ?`,
                [email]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('UserModel.verifyUser error:', error);
            throw error;
        }
    }
}

module.exports = UserModel;