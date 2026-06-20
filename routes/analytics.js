const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Analytics } = require('../models');

// Track event
router.post('/track', async (req, res) => {
  try {
    const { eventType, userId, bookId, sessionId, metadata, ipAddress, userAgent, referrer } = req.body;

    const analytics = await Analytics.create({
      eventType,
      userId,
      bookId,
      sessionId,
      metadata,
      ipAddress,
      userAgent,
      referrer,
      device: metadata?.device || {},
      location: metadata?.location || {}
    });

    res.status(201).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
