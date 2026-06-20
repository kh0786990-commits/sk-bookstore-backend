const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

console.log('=== Database Configuration Debug ===');
console.log('Database Type: SQLite (no installation needed)');
console.log('Sequelize instance:', sequelize ? 'Available' : 'Not Available');
console.log('=====================================');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'super_admin'),
    defaultValue: 'user'
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  subscription: {
    type: DataTypes.ENUM('free', 'premium', 'premium_plus'),
    defaultValue: 'free'
  },
  subscriptionExpire: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  readingStats: {
    type: DataTypes.JSON, // Changed from JSONB for SQLite compatibility
    defaultValue: {
      booksRead: 0,
      pagesRead: 0,
      readingTime: 0
    }
  },
  preferences: {
    type: DataTypes.JSON, // Changed from JSONB for SQLite compatibility
    defaultValue: {
      theme: 'light',
      fontSize: 16,
      fontFamily: 'default',
      notifications: true,
      emailNewsletter: false
    }
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  instanceMethods: {
    comparePassword: async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    },
    toJSON: function() {
      const values = { ...this.get() };
      delete values.password;
      delete values.verificationToken;
      delete values.resetPasswordToken;
      delete values.resetPasswordExpire;
      return values;
    }
  }
});

console.log('User model defined successfully');

module.exports = User;