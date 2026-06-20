const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (for mobile apps)
router.get('/config/:platform', optionalAuth, adsController.getAdConfig);
router.get('/units/:platform/:placement', optionalAuth, adsController.getAdUnitsByPlatform);
router.post('/track', optionalAuth, adsController.trackAdPerformance);

// Admin routes (protected)
router.get('/', protect, authorize('admin', 'super_admin'), adsController.getAllAdUnits);
router.get('/analytics', protect, authorize('admin', 'super_admin'), adsController.getAdAnalytics);
router.get('/:id', protect, authorize('admin', 'super_admin'), adsController.getAdUnitById);
router.post('/', protect, authorize('admin', 'super_admin'), adsController.createAdUnit);
router.put('/:id', protect, authorize('admin', 'super_admin'), adsController.updateAdUnit);
router.delete('/:id', protect, authorize('admin', 'super_admin'), adsController.deleteAdUnit);

module.exports = router;
