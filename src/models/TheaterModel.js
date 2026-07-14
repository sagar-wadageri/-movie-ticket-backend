const { query } = require('../config/database');

class TheaterModel {
    static async getAll() {
        try {
            const theaters = await query(
                'SELECT id, name, city, total_seats FROM theaters WHERE is_active = true'
            );
            return theaters;
        } catch (error) {
            console.error('TheaterModel.getAll error:', error);
            throw error;
        }
    }
}

module.exports = TheaterModel;