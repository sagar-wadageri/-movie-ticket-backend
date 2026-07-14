const { query } = require('../config/database');

class ShowModel {
    // Get shows for a specific movie
    static async getByMovie(movieId) {
        try {
            const shows = await query(
                `SELECT 
                    s.id,
                    s.movie_id,
                    s.screen_number,
                    s.start_time,
                    s.end_time,
                    s.base_price,
                    s.premium_price,
                    t.id as theater_id,
                    t.name as theater_name,
                    t.city,
                    (SELECT COUNT(*) FROM seats WHERE show_id = s.id AND status = 'available') as available_seats,
                    (SELECT COUNT(*) FROM seats WHERE show_id = s.id) as total_seats
                 FROM shows s
                 JOIN theaters t ON s.theater_id = t.id
                 WHERE s.movie_id = ? AND s.is_active = true AND s.start_time > NOW()
                 ORDER BY s.start_time`,
                [movieId]
            );
            return shows;
        } catch (error) {
            console.error('ShowModel.getByMovie error:', error);
            throw error;
        }
    }

    // Get show by ID with details
    static async findById(showId) {
        try {
            const [show] = await query(
                `SELECT 
                    s.*,
                    m.title as movie_title,
                    m.duration,
                    m.poster_url,
                    t.name as theater_name,
                    t.city
                 FROM shows s
                 JOIN movies m ON s.movie_id = m.id
                 JOIN theaters t ON s.theater_id = t.id
                 WHERE s.id = ?`,
                [showId]
            );
            return show || null;
        } catch (error) {
            console.error('ShowModel.findById error:', error);
            throw error;
        }
    }

    // Generate seats for a show
static async generateSeats(showId, theaterId) {
    try {
        // Get total seats from theater
        const [theater] = await query(
            'SELECT total_seats FROM theaters WHERE id = ?',
            [theaterId]
        );

        if (!theater) {
            throw new Error('Theater not found');
        }

        const totalSeats = theater.total_seats;
        const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const seats = [];
        let seatIndex = 1;

        for (let row of rows) {
            for (let col = 1; col <= 10; col++) {
                if (seatIndex > totalSeats) break;
                const seatNumber = `${row}${col}`;
                const price = col <= 6 ? 250 : 350; // Premium seats are last 4 columns
                const seatType = col <= 6 ? 'standard' : 'premium';
                seats.push(`(${showId}, '${seatNumber}', '${row}', '${seatType}', 'available', ${price})`);
                seatIndex++;
            }
            if (seatIndex > totalSeats) break;
        }

        if (seats.length === 0) {
            throw new Error('No seats generated');
        }

        await query(
            `INSERT INTO seats (show_id, seat_number, row_number, seat_type, status, price)
             VALUES ${seats.join(', ')}`
        );

        return seats.length;
    } catch (error) {
        console.error('ShowModel.generateSeats error:', error);
        throw error;
    }
}

    // Create show (Admin)
    static async create(showData) {
        try {
            const { movie_id, theater_id, screen_number, start_time, end_time, base_price, premium_price } = showData;

            const result = await query(
                `INSERT INTO shows 
                 (movie_id, theater_id, screen_number, start_time, end_time, base_price, premium_price)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [movie_id, theater_id, screen_number, start_time, end_time, base_price, premium_price]
            );

            return result.insertId;
        } catch (error) {
            console.error('ShowModel.create error:', error);
            throw error;
        }
    }
}

module.exports = ShowModel;