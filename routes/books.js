const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadBookAndCover, uploadBook, uploadCover } = require('../middleware/upload');
const { bookValidation, bookQueryValidation } = require('../middleware/validation');

// Public routes
router.get('/', bookQueryValidation, optionalAuth, bookController.getAllBooks);
router.get('/featured', bookController.getFeaturedBooks);
router.get('/bestsellers', bookController.getBestsellerBooks);
router.get('/new-arrivals', bookController.getNewArrivals);
router.get('/search', bookController.searchBooks);
router.get('/:id', optionalAuth, bookController.getBookById);
router.get('/:id/download', protect, bookController.downloadBook);

// Admin routes
router.post('/', protect, authorize('admin', 'super_admin'), uploadBookAndCover, bookValidation, bookController.createBook);
router.put('/:id', protect, authorize('admin', 'super_admin'), uploadBookAndCover, bookValidation, bookController.updateBook);
router.delete('/:id', protect, authorize('admin', 'super_admin'), bookController.deleteBook);

module.exports = router;
