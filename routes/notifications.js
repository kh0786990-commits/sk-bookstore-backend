const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder for notification routes
router.get('/', protect, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { notifications: [] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
