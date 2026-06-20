const { AdUnit, AdPerformance } = require('../models');
const { Op } = require('sequelize');

// Get all ad units
exports.getAllAdUnits = async (req, res) => {
  try {
    const { page = 1, limit = 20, type = '', platform = '', placement = '', isActive = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (platform) where.platform = platform;
    if (placement) where.placement = placement;
    if (isActive !== '') where.isActive = isActive === 'true';

    const { count, rows } = await AdUnit.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        adUnits: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get ad units by platform and placement (for mobile apps)
exports.getAdUnitsByPlatform = async (req, res) => {
  try {
    const { platform, placement } = req.params;

    const adUnits = await AdUnit.findAll({
      where: {
        platform,
        placement,
        isActive: true
      },
      order: [['priority', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { adUnits }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single ad unit
exports.getAdUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const adUnit = await AdUnit.findByPk(id);
    if (!adUnit) {
      return res.status(404).json({
        status: 'error',
        message: 'Ad unit not found'
      });
    }

    res.json({
      status: 'success',
      data: { adUnit }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new ad unit
exports.createAdUnit = async (req, res) => {
  try {
    const adUnitData = req.body;
    adUnitData.createdBy = req.user.id;

    const adUnit = await AdUnit.create(adUnitData);

    res.status(201).json({
      status: 'success',
      message: 'Ad unit created successfully',
      data: { adUnit }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update ad unit
exports.updateAdUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const adUnit = await AdUnit.findByPk(id);
    if (!adUnit) {
      return res.status(404).json({
        status: 'error',
        message: 'Ad unit not found'
      });
    }

    await adUnit.update(updates);

    res.json({
      status: 'success',
      message: 'Ad unit updated successfully',
      data: { adUnit }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete ad unit
exports.deleteAdUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const adUnit = await AdUnit.findByPk(id);
    if (!adUnit) {
      return res.status(404).json({
        status: 'error',
        message: 'Ad unit not found'
      });
    }

    await adUnit.destroy();

    res.json({
      status: 'success',
      message: 'Ad unit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Track ad performance
exports.trackAdPerformance = async (req, res) => {
  try {
    const {
      adUnitId,
      userId,
      sessionId,
      eventType,
      placement,
      revenue = 0,
      metadata = {}
    } = req.body;

    const performance = await AdPerformance.create({
      adUnitId,
      userId,
      sessionId,
      eventType,
      placement,
      revenue,
      metadata,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update ad unit performance stats
    const adUnit = await AdUnit.findByPk(adUnitId);
    if (adUnit) {
      const currentPerformance = adUnit.performance || {
        impressions: 0,
        clicks: 0,
        revenue: 0,
        ctr: 0,
        fillRate: 0
      };

      if (eventType === 'impression') {
        currentPerformance.impressions++;
      } else if (eventType === 'click') {
        currentPerformance.clicks++;
      }

      currentPerformance.revenue = parseFloat(currentPerformance.revenue) + parseFloat(revenue);
      
      if (currentPerformance.impressions > 0) {
        currentPerformance.ctr = (currentPerformance.clicks / currentPerformance.impressions) * 100;
      }

      adUnit.performance = currentPerformance;
      await adUnit.save();
    }

    res.status(201).json({
      status: 'success',
      data: { performance }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get ad analytics
exports.getAdAnalytics = async (req, res) => {
  try {
    const { period = '7d', adUnitId = '' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    const where = {
      createdAt: { [Op.gte]: startDate }
    };

    if (adUnitId) {
      where.adUnitId = adUnitId;
    }

    const performances = await AdPerformance.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 10000
    });

    // Process analytics data
    const analytics = {
      totalEvents: performances.length,
      eventsByType: {},
      eventsByPlacement: {},
      eventsByDay: {},
      totalRevenue: 0,
      totalImpressions: 0,
      totalClicks: 0,
      averageCTR: 0,
      topPerformingAds: {},
      revenueByDay: {}
    };

    performances.forEach(event => {
      // Count by type
      if (!analytics.eventsByType[event.eventType]) {
        analytics.eventsByType[event.eventType] = 0;
      }
      analytics.eventsByType[event.eventType]++;

      // Count by placement
      if (!analytics.eventsByPlacement[event.placement]) {
        analytics.eventsByPlacement[event.placement] = 0;
      }
      analytics.eventsByPlacement[event.placement]++;

      // Count by day
      const day = event.createdAt.toISOString().split('T')[0];
      if (!analytics.eventsByDay[day]) {
        analytics.eventsByDay[day] = 0;
      }
      analytics.eventsByDay[day]++;

      // Track revenue
      analytics.totalRevenue = parseFloat(analytics.totalRevenue) + parseFloat(event.revenue || 0);

      // Track impressions and clicks
      if (event.eventType === 'impression') {
        analytics.totalImpressions++;
      } else if (event.eventType === 'click') {
        analytics.totalClicks++;
      }

      // Track revenue by day
      if (!analytics.revenueByDay[day]) {
        analytics.revenueByDay[day] = 0;
      }
      analytics.revenueByDay[day] = parseFloat(analytics.revenueByDay[day]) + parseFloat(event.revenue || 0);

      // Track top performing ads
      if (!analytics.topPerformingAds[event.adUnitId]) {
        analytics.topPerformingAds[event.adUnitId] = {
          impressions: 0,
          clicks: 0,
          revenue: 0
        };
      }
      if (event.eventType === 'impression') {
        analytics.topPerformingAds[event.adUnitId].impressions++;
      } else if (event.eventType === 'click') {
        analytics.topPerformingAds[event.adUnitId].clicks++;
      }
      analytics.topPerformingAds[event.adUnitId].revenue += parseFloat(event.revenue || 0);
    });

    // Calculate average CTR
    if (analytics.totalImpressions > 0) {
      analytics.averageCTR = (analytics.totalClicks / analytics.totalImpressions) * 100;
    }

    res.json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get ad configuration for mobile app
exports.getAdConfig = async (req, res) => {
  try {
    const { platform } = req.params;

    const adUnits = await AdUnit.findAll({
      where: {
        platform,
        isActive: true
      },
      order: [['priority', 'DESC']]
    });

    // Group by placement
    const config = {};
    adUnits.forEach(adUnit => {
      if (!config[adUnit.placement]) {
        config[adUnit.placement] = [];
      }
      config[adUnit.placement].push({
        id: adUnit.id,
        type: adUnit.type,
        adUnitId: adUnit.adUnitId,
        frequency: adUnit.frequency,
        targeting: adUnit.targeting,
        schedule: adUnit.schedule
      });
    });

    res.json({
      status: 'success',
      data: { config }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
