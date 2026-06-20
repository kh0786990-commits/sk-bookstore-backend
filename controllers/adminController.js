const { User, Book, Category, Review, Purchase, Analytics, Settings } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current stats
    const [
      totalUsers,
      totalBooks,
      totalPurchases,
      totalRevenue,
      monthlyUsers,
      monthlyBooks,
      monthlyPurchases,
      monthlyRevenue
    ] = await Promise.all([
      User.count(),
      Book.count({ where: { status: 'published' } }),
      Purchase.count({ where: { paymentStatus: 'completed' } }),
      Purchase.sum('amount', { where: { paymentStatus: 'completed' } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Book.count({ where: { status: 'published', createdAt: { [Op.gte]: startOfMonth } } }),
      Purchase.count({ where: { paymentStatus: 'completed', createdAt: { [Op.gte]: startOfMonth } } }),
      Purchase.sum('amount', { where: { paymentStatus: 'completed', createdAt: { [Op.gte]: startOfMonth } } })
    ]);

    // Get last month stats for comparison
    const [
      lastMonthUsers,
      lastMonthBooks,
      lastMonthPurchases,
      lastMonthRevenue
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
      Book.count({ where: { status: 'published', createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
      Purchase.count({ where: { paymentStatus: 'completed', createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
      Purchase.sum('amount', { where: { paymentStatus: 'completed', createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(2);
    };

    const userGrowth = calculateGrowth(monthlyUsers, lastMonthUsers);
    const bookGrowth = calculateGrowth(monthlyBooks, lastMonthBooks);
    const purchaseGrowth = calculateGrowth(monthlyPurchases, lastMonthPurchases);
    const revenueGrowth = calculateGrowth(monthlyRevenue || 0, lastMonthRevenue || 0);

    // Get recent activities
    const recentBooks = await Book.findAll({
      where: { status: 'published' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }]
    });

    const recentPurchases = await Purchase.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: Book, as: 'book', attributes: ['title', 'coverImage'] }
      ]
    });

    const recentReviews = await Review.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { model: User, as: 'user', attributes: ['name', 'avatar'] },
        { model: Book, as: 'book', attributes: ['title'] }
      ]
    });

    // Get category distribution
    const categories = await Category.findAll({ where: { isActive: true } });
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await Book.count({
          where: {
            categories: { [Op.contains]: [category.name] },
            status: 'published'
          }
        });
        return {
          name: category.name,
          count: bookCount
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          totalBooks,
          totalPurchases,
          totalRevenue: totalRevenue || 0
        },
        monthly: {
          users: monthlyUsers,
          books: monthlyBooks,
          purchases: monthlyPurchases,
          revenue: monthlyRevenue || 0
        },
        growth: {
          users: parseFloat(userGrowth),
          books: parseFloat(bookGrowth),
          purchases: parseFloat(purchaseGrowth),
          revenue: parseFloat(revenueGrowth)
        },
        recent: {
          books: recentBooks,
          purchases: recentPurchases,
          reviews: recentReviews
        },
        categoryDistribution: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      status: 'success',
      data: {
        users: rows,
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

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get system settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      where: { category: req.query.category || 'general' }
    });

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic
      };
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
};

// Update system settings
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await Settings.upsert({
        key,
        value: typeof value === 'object' ? value : { value },
        category: req.body.category || 'general',
        description: req.body.description || ''
      });
    }

    res.json({
      status: 'success',
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '7d', type = 'all' } = req.query;
    
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

    const where = { createdAt: { [Op.gte]: startDate } };
    if (type !== 'all') {
      where.eventType = type;
    }

    const analytics = await Analytics.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 1000
    });

    // Process analytics data
    const processedData = {
      totalEvents: analytics.length,
      eventsByType: {},
      eventsByDay: {},
      topBooks: {},
      topUsers: {}
    };

    analytics.forEach(event => {
      // Count by type
      if (!processedData.eventsByType[event.eventType]) {
        processedData.eventsByType[event.eventType] = 0;
      }
      processedData.eventsByType[event.eventType]++;

      // Count by day
      const day = event.createdAt.toISOString().split('T')[0];
      if (!processedData.eventsByDay[day]) {
        processedData.eventsByDay[day] = 0;
      }
      processedData.eventsByDay[day]++;

      // Track top books
      if (event.bookId) {
        if (!processedData.topBooks[event.bookId]) {
          processedData.topBooks[event.bookId] = 0;
        }
        processedData.topBooks[event.bookId]++;
      }

      // Track top users
      if (event.userId) {
        if (!processedData.topUsers[event.userId]) {
          processedData.topUsers[event.userId] = 0;
        }
        processedData.topUsers[event.userId]++;
      }
    });

    res.json({
      status: 'success',
      data: { analytics: processedData }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
