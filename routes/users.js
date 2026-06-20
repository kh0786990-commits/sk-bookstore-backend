const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.get('/profile', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
