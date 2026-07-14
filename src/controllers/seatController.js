const SeatModel = require('../models/SeatModel');
const StatusCodes = require('../utils/statusCodes');

// Get seats for a show
const getSeatsByShow = async (req, res) => {
    try {
        const { showId } = req.params;

        if (!showId || isNaN(showId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid show ID'
            });
        }

        const seats = await SeatModel.getByShow(parseInt(showId));

        return res.status(StatusCodes.OK).json({
            success: true,
            seats
        });

    } catch (error) {
        console.error('Get seats error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to fetch seats'
        });
    }
};

module.exports = {
    getSeatsByShow
};