const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'usd'
  },
  paymentMethod: {
    type: DataTypes.ENUM('stripe', 'paypal', 'free', 'subscription'),
    defaultValue: 'stripe'
  },
  paymentId: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discountCode: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  purchaseType: {
    type: DataTypes.ENUM('single', 'bundle', 'subscription'),
    defaultValue: 'single'
  },
  isGift: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  giftRecipientEmail: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  giftMessage: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  refundedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: null
  },
  refundReason: {
    type: DataTypes.TEXT,
    defaultValue: null
  }
}, {
  tableName: 'purchases',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

module.exports = Purchase;
