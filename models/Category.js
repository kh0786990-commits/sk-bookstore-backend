const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#000000'
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  parentId: {
    type: DataTypes.UUID,
    defaultValue: null
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bookCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  seo: {
    type: DataTypes.JSON,
    defaultValue: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    }
  }
}, {
  tableName: 'categories',
  hooks: {
    beforeCreate: (category) => {
      if (!category.slug) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

module.exports = Category;
