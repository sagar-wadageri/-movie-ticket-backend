const { query } = require('../config/database');

class MovieModel {
    // Get all movies with pagination and filters
    static async getAll(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (filters.genre) {
                whereClause += ' AND genre LIKE ?';
                params.push(`%${filters.genre}%`);
            }

            if (filters.language) {
                whereClause += ' AND language = ?';
                params.push(filters.language);
            }

            if (filters.search) {
                whereClause += ' AND (title LIKE ? OR description LIKE ?)';
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            const movies = await query(
                `SELECT id, tmdb_id, title, description, poster_url, backdrop_url,
                        release_date, duration, rating, genre, language, is_active
                 FROM movies 
                 ${whereClause}
                 ORDER BY release_date DESC 
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(limit), parseInt(offset)]
            );

            const [count] = await query(
                `SELECT COUNT(*) as total FROM movies ${whereClause}`,
                params
            );

            return {
                movies,
                total: count.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count.total / limit)
            };
        } catch (error) {
            console.error('MovieModel.getAll error:', error);
            throw error;
        }
    }

    // Get movie by ID
    static async findById(id) {
        try {
            const movies = await query(
                `SELECT id, tmdb_id, title, description, poster_url, backdrop_url,
                        trailer_url, release_date, duration, rating, genre, language,
                        is_active, created_at
                 FROM movies 
                 WHERE id = ?`,
                [id]
            );

            if (movies.length === 0) return null;
            return movies[0];
        } catch (error) {
            console.error('MovieModel.findById error:', error);
            throw error;
        }
    }

    // Get movie by TMDB ID
    static async findByTmdbId(tmdbId) {
        try {
            const movies = await query(
                'SELECT * FROM movies WHERE tmdb_id = ?',
                [tmdbId]
            );
            return movies[0] || null;
        } catch (error) {
            console.error('MovieModel.findByTmdbId error:', error);
            throw error;
        }
    }

    // Create movie
   static async create(movieData) {
    try {
        const {
            tmdb_id = null,
            title,
            description = null,
            poster_url = null,
            backdrop_url = null,
            trailer_url = null,
            release_date,
            duration,
            rating = null,
            genre = null,
            language = null
        } = movieData;

        const result = await query(
            `INSERT INTO movies 
             (tmdb_id, title, description, poster_url, backdrop_url, 
              trailer_url, release_date, duration, rating, genre, language)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tmdb_id, title, description, poster_url, backdrop_url,
             trailer_url, release_date, duration, rating, genre, language]
        );

        return result.insertId;
    } catch (error) {
        console.error('MovieModel.create error:', error);
        throw error;
    }
}
    // Update movie
    static async update(id, movieData) {
    try {
        const {
            title,
            description,
            poster_url,
            backdrop_url,
            trailer_url,
            release_date,
            duration,
            rating,
            genre,
            language,
            is_active
        } = movieData;

        const result = await query(
            `UPDATE movies SET 
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                poster_url = COALESCE(?, poster_url),
                backdrop_url = COALESCE(?, backdrop_url),
                trailer_url = COALESCE(?, trailer_url),
                release_date = COALESCE(?, release_date),
                duration = COALESCE(?, duration),
                rating = COALESCE(?, rating),
                genre = COALESCE(?, genre),
                language = COALESCE(?, language),
                is_active = COALESCE(?, is_active)
             WHERE id = ?`,
            [
                title || null,
                description || null,
                poster_url || null,
                backdrop_url || null,
                trailer_url || null,
                release_date || null,
                duration || null,
                rating || null,
                genre || null,
                language || null,
                is_active !== undefined ? is_active : null,
                id
            ]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('MovieModel.update error:', error);
        throw error;
    }
}

    // Delete movie
    static async delete(id) {
        try {
            const result = await query(
                'DELETE FROM movies WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('MovieModel.delete error:', error);
            throw error;
        }
    }
}

module.exports = MovieModel;