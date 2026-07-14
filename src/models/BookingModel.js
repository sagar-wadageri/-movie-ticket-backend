const { query, transaction } = require('../config/database');

class BookingModel {
    // Create booking with seats (uses transaction)
    static async createBookingWithSeats(userId, showId, seatIds) {
        try {
            const result = await transaction(async (connection) => {
                // 1. Check seats availability with lock
                const [seats] = await connection.query(
                    `SELECT id, seat_number, price, status 
                     FROM seats 
                     WHERE show_id = ? AND id IN (?) 
                     FOR UPDATE`,
                    [showId, seatIds]
                );

                if (seats.length !== seatIds.length) {
                    throw new Error('Some seats do not exist');
                }

                const unavailableSeats = seats.filter(s => s.status !== 'available');
                if (unavailableSeats.length > 0) {
                    throw new Error(`Seats ${unavailableSeats.map(s => s.seat_number).join(', ')} are not available`);
                }

                // 2. Calculate total
                const totalAmount = seats.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
                
                // 3. Generate booking reference
                const bookingRef = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
                
                // 4. Create booking
                const [bookingResult] = await connection.query(
                    `INSERT INTO bookings 
                     (booking_reference, user_id, show_id, total_seats, total_amount, final_amount, expires_at)
                     VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
                    [bookingRef, userId, showId, seatIds.length, totalAmount, totalAmount]
                );

                const bookingId = bookingResult.insertId;

                // 5. Update seats to 'reserved'
                await connection.query(
                    `UPDATE seats SET status = 'reserved' 
                     WHERE id IN (?) AND show_id = ?`,
                    [seatIds, showId]
                );

                // 6. Link seats to booking
                const seatValues = seats.map(seat => 
                    `(${bookingId}, ${seat.id}, ${seat.price})`
                ).join(',');

                await connection.query(
                    `INSERT INTO booking_seats (booking_id, seat_id, seat_price) 
                     VALUES ${seatValues}`
                );

                return {
                    bookingId,
                    bookingRef,
                    totalAmount,
                    seats: seats.map(s => s.seat_number)
                };
            });

            return result;
        } catch (error) {
            console.error('BookingModel.createBookingWithSeats error:', error);
            throw error;
        }
    }

    // Get booking by ID
    static async findById(id) {
        try {
            const bookings = await query(
                `SELECT b.*, 
                        m.title as movie_title,
                        t.name as theater_name,
                        s.start_time, s.end_time,
                        GROUP_CONCAT(DISTINCT se.seat_number ORDER BY se.seat_number) as seats
                 FROM bookings b
                 JOIN shows s ON b.show_id = s.id
                 JOIN movies m ON s.movie_id = m.id
                 JOIN theaters t ON s.theater_id = t.id
                 JOIN booking_seats bs ON b.id = bs.booking_id
                 JOIN seats se ON bs.seat_id = se.id
                 WHERE b.id = ?
                 GROUP BY b.id`,
                [id]
            );
            return bookings[0] || null;
        } catch (error) {
            console.error('BookingModel.findById error:', error);
            throw error;
        }
    }

    // Get user bookings with pagination
    static async getByUser(userId, status = null, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'b.user_id = ?';
            const params = [userId];

            if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
                whereClause += ' AND b.status = ?';
                params.push(status);
            }

            const bookings = await query(
                `SELECT b.id, b.booking_reference, b.total_seats, b.total_amount,
                        b.final_amount, b.status, b.booking_date,
                        m.title as movie_title, m.poster_url,
                        t.name as theater_name,
                        s.start_time, s.end_time,
                        GROUP_CONCAT(DISTINCT se.seat_number ORDER BY se.seat_number) as seats
                 FROM bookings b
                 JOIN shows s ON b.show_id = s.id
                 JOIN movies m ON s.movie_id = m.id
                 JOIN theaters t ON s.theater_id = t.id
                 JOIN booking_seats bs ON b.id = bs.booking_id
                 JOIN seats se ON bs.seat_id = se.id
                 WHERE ${whereClause}
                 GROUP BY b.id
                 ORDER BY b.booking_date DESC
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(limit), parseInt(offset)]
            );

            const [count] = await query(
                `SELECT COUNT(DISTINCT b.id) as total 
                 FROM bookings b
                 WHERE ${whereClause}`,
                params
            );

            return {
                bookings,
                total: count.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count.total / limit)
            };
        } catch (error) {
            console.error('BookingModel.getByUser error:', error);
            throw error;
        }
    }

    // Confirm booking
    static async confirm(id, paymentId, paymentMethod) {
        try {
            const result = await query(
                `UPDATE bookings SET 
                 status = 'confirmed',
                 payment_id = ?,
                 payment_method = ?
                 WHERE id = ? AND status = 'pending'`,
                [paymentId, paymentMethod, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('BookingModel.confirm error:', error);
            throw error;
        }
    }

    // Cancel booking
    static async cancel(id) {
        try {
            const result = await query(
                'UPDATE bookings SET status = "cancelled" WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('BookingModel.cancel error:', error);
            throw error;
        }
    }

    // Check if booking belongs to user
    static async belongsToUser(bookingId, userId) {
        try {
            const [booking] = await query(
                'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
                [bookingId, userId]
            );
            return !!booking;
        } catch (error) {
            console.error('BookingModel.belongsToUser error:', error);
            throw error;
        }
    }
}

module.exports = BookingModel;