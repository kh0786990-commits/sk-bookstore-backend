const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'settings'
});

module.exports = Settings;
