const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes (anyone can view)
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Admin only routes
router.post('/', authenticate, isAdmin, movieController.createMovie);
router.put('/:id', authenticate, isAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, isAdmin, movieController.deleteMovie);

module.exports = router;