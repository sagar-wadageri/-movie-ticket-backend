const ShowModel = require('../models/ShowModel');
const StatusCodes = require('../utils/statusCodes');

// Get shows for a movie
const getShowsByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!movieId || isNaN(movieId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid movie ID'
            });
        }

        const shows = await ShowModel.getByMovie(parseInt(movieId));

        return res.status(StatusCodes.OK).json({
            success: true,
            shows
        });

    } catch (error) {
        console.error('Get shows error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to fetch shows'
        });
    }
};

// Get show by ID
const getShowById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid show ID'
            });
        }

        const show = await ShowModel.findById(parseInt(id));
        if (!show) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Show not found'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            show
        });

    } catch (error) {
        console.error('Get show error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to fetch show'
        });
    }
};

// Create show (Admin only)
const createShow = async (req, res) => {
    try {
        const { movie_id, theater_id, screen_number, start_time, end_time, base_price, premium_price } = req.body;

        if (!movie_id || !theater_id || !screen_number || !start_time || !end_time || !base_price) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'All fields are required'
            });
        }

        const showId = await ShowModel.create({
            movie_id,
            theater_id,
            screen_number,
            start_time,
            end_time,
            base_price,
            premium_price
        });

        // 🆕 AUTO-GENERATE SEATS FOR THIS SHOW
        const seatsGenerated = await ShowModel.generateSeats(showId, theater_id);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Show created successfully with ${seatsGenerated} seats`,
            showId,
            seatsGenerated
        });

    } catch (error) {
        console.error('Create show error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to create show'
        });
    }
};

module.exports = {
    getShowsByMovie,
    getShowById,
    createShow
};