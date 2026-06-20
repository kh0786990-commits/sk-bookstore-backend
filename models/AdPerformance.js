const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdPerformance = sequelize.define('AdPerformance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adUnitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ad_units',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: null
  },
  sessionId: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  eventType: {
    type: DataTypes.ENUM('impression', 'click', 'rewarded', 'failed', 'loaded'),
    allowNull: false
  },
  placement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  revenue: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0.0000
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {
      deviceInfo: {},
      bookInfo: null,
      pageNumber: null,
      adSize: null,
      loadTime: null
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  userAgent: {
    type: DataTypes.STRING,
    defaultValue: null
  }
}, {
  tableName: 'ad_performance',
  indexes: [
    {
      fields: ['adUnitId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['eventType']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['placement']
    }
  ]
});

module.exports = AdPerformance;
