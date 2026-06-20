const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder for purchase routes
router.get('/', protect, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { purchases: [] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
