const { query } = require('../config/database');

class SeatModel {
    // Get seats for a show
    static async getByShow(showId) {
        try {
            const seats = await query(
                `SELECT id, seat_number, row_number, seat_type, status, price
                 FROM seats
                 WHERE show_id = ?
                 ORDER BY row_number, seat_number`,
                [showId]
            );
            return seats;
        } catch (error) {
            console.error('SeatModel.getByShow error:', error);
            throw error;
        }
    }

    // Update seat status to booked
    static async bookSeats(bookingId) {
        try {
            await query(
                `UPDATE seats s
                 JOIN booking_seats bs ON bs.seat_id = s.id
                 SET s.status = 'booked'
                 WHERE bs.booking_id = ?`,
                [bookingId]
            );
            return true;
        } catch (error) {
            console.error('SeatModel.bookSeats error:', error);
            throw error;
        }
    }

    // Release seats (for cancellation)
    static async releaseSeats(bookingId) {
        try {
            await query(
                `UPDATE seats s
                 JOIN booking_seats bs ON bs.seat_id = s.id
                 SET s.status = 'available'
                 WHERE bs.booking_id = ?`,
                [bookingId]
            );
            return true;
        } catch (error) {
            console.error('SeatModel.releaseSeats error:', error);
            throw error;
        }
    }

    // Get seat numbers by IDs
    static async getSeatNumbers(seatIds) {
        try {
            const seats = await query(
                'SELECT seat_number FROM seats WHERE id IN (?)',
                [seatIds]
            );
            return seats.map(s => s.seat_number);
        } catch (error) {
            console.error('SeatModel.getSeatNumbers error:', error);
            throw error;
        }
    }
}

module.exports = SeatModel;