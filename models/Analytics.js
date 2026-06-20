const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventType: {
    type: DataTypes.ENUM(
      'page_view',
      'book_view',
      'book_download',
      'purchase',
      'registration',
      'login',
      'search',
      'category_view',
      'author_view',
      'review',
      'rating',
      'share',
      'bookmark',
      'reading_progress'
    ),
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: null
  },
  bookId: {
    type: DataTypes.UUID,
    defaultValue: null
  },
  sessionId: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  userAgent: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  referrer: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  device: {
    type: DataTypes.JSON,
    defaultValue: {
      type: null,
      os: null,
      browser: null
    }
  },
  location: {
    type: DataTypes.JSON,
    defaultValue: {
      country: null,
      city: null,
      region: null
    }
  }
}, {
  tableName: 'analytics',
  indexes: [
    {
      fields: ['eventType']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['bookId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Analytics;
