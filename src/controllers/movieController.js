const MovieModel = require('../models/MovieModel');
const StatusCodes = require('../utils/statusCodes');

// ✅ GET ALL MOVIES
const getAllMovies = async (req, res) => {
    try {
        const { page = 1, limit = 10, genre, language, search } = req.query;

        const filters = { genre, language, search };
        const result = await MovieModel.getAll(
            parseInt(page), 
            parseInt(limit), 
            filters
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Get movies error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to fetch movies'
        });
    }
};

// ✅ GET MOVIE BY ID
const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid movie ID'
            });
        }

        const movie = await MovieModel.findById(parseInt(id));
        if (!movie) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Movie not found'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            movie
        });

    } catch (error) {
        console.error('Get movie error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to fetch movie'
        });
    }
};

// ✅ CREATE MOVIE (Admin only)
const createMovie = async (req, res) => {
    try {
        const {
            tmdb_id, title, description, poster_url, backdrop_url,
            trailer_url, release_date, duration, rating, genre, language
        } = req.body;

        if (!title || !duration) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Title and duration are required'
            });
        }

        if (tmdb_id) {
            const existing = await MovieModel.findByTmdbId(tmdb_id);
            if (existing) {
                return res.status(StatusCodes.CONFLICT).json({
                    error: 'Movie already exists with this TMDB ID'
                });
            }
        }

        const movieId = await MovieModel.create({
            tmdb_id, title, description, poster_url, backdrop_url,
            trailer_url, release_date, duration, rating, genre, language
        });

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Movie created successfully',
            movieId
        });

    } catch (error) {
        console.error('Create movie error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to create movie'
        });
    }
};

// ✅ UPDATE MOVIE (Admin only)
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid movie ID'
            });
        }

        const movie = await MovieModel.findById(parseInt(id));
        if (!movie) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Movie not found'
            });
        }

        const updated = await MovieModel.update(parseInt(id), req.body);
        if (!updated) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Failed to update movie'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Movie updated successfully'
        });

    } catch (error) {
        console.error('Update movie error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to update movie'
        });
    }
};

// ✅ DELETE MOVIE (Admin only)
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid movie ID'
            });
        }

        const movie = await MovieModel.findById(parseInt(id));
        if (!movie) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Movie not found'
            });
        }

        const deleted = await MovieModel.delete(parseInt(id));
        if (!deleted) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Failed to delete movie'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Movie deleted successfully'
        });

    } catch (error) {
        console.error('Delete movie error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to delete movie'
        });
    }
};

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
};