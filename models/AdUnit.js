const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdUnit = sequelize.define('AdUnit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('banner', 'interstitial', 'rewarded', 'native', 'app_open'),
    allowNull: false
  },
  platform: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: false
  },
  adUnitId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  placement: {
    type: DataTypes.ENUM('header', 'footer', 'reader_bottom', 'reader_top', 'book_open', 'page_turn', 'home_screen', 'library_screen', 'browse_screen'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  frequency: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Show ad after X actions (e.g., every 10 pages)'
  },
  targeting: {
    type: DataTypes.JSON,
    defaultValue: {
      countries: [],
      userTypes: [],
      bookCategories: [],
      minAge: null,
      maxAge: null
    }
  },
  schedule: {
    type: DataTypes.JSON,
    defaultValue: {
      startDate: null,
      endDate: null,
      daysOfWeek: [],
      hoursOfDay: []
    }
  },
  performance: {
    type: DataTypes.JSON,
    defaultValue: {
      impressions: 0,
      clicks: 0,
      revenue: 0,
      ctr: 0,
      fillRate: 0
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'ad_units',
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['placement']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = AdUnit;
