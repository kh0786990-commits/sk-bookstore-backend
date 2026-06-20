const express = require('express');
const router = express.Router();
const { Settings } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// Get public settings
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.findAll({
      where: { isPublic: true }
    });

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({
      status: 'success',
      data: { settings: settingsObj }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
