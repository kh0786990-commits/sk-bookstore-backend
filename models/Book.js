const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coAuthors: {
    type: DataTypes.JSON, // Changed from ARRAY for SQLite compatibility
    defaultValue: []
  },
  isbn: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      len: [10, 13]
    }
  },
  publisher: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  publishDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  pages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.ENUM('pdf', 'epub', 'mobi', 'txt', 'docx', 'doc', 'fb2', 'rtf'),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coverImage: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  coverImages: {
    type: DataTypes.JSON, // Changed from ARRAY for SQLite compatibility
    defaultValue: []
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: null
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isBestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requiresSubscription: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  categories: {
    type: DataTypes.JSON, // Changed from ARRAY for SQLite compatibility
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON, // Changed from ARRAY for SQLite compatibility
    defaultValue: []
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downloadsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  purchasesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  readingProgress: {
    type: DataTypes.JSON, // Changed from JSONB for SQLite compatibility
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSON, // Changed from JSONB for SQLite compatibility
    defaultValue: {
      series: null,
      seriesNumber: null,
      edition: null,
      format: null,
      dimensions: null,
      weight: null
    }
  },
  seo: {
    type: DataTypes.JSON, // Changed from JSONB for SQLite compatibility
    defaultValue: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'deleted'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  publishedBy: {
    type: DataTypes.UUID,
    defaultValue: null
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.UUID,
    defaultValue: null
  }
}, {
  tableName: 'books',
  hooks: {
    beforeCreate: (book) => {
      if (!book.slug) {
        book.slug = book.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

module.exports = Book;
