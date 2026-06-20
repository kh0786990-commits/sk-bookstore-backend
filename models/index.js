const { sequelize } = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Review = require('./Review');
const Purchase = require('./Purchase');
const Settings = require('./Settings');
const Analytics = require('./Analytics');
const AdUnit = require('./AdUnit');
const AdPerformance = require('./AdPerformance');

// Define relationships
User.hasMany(Book, { foreignKey: 'createdBy', as: 'createdBooks' });
User.hasMany(Book, { foreignKey: 'updatedBy', as: 'updatedBooks' });
User.hasMany(Book, { foreignKey: 'publishedBy', as: 'publishedBooks' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
User.hasMany(Analytics, { foreignKey: 'userId', as: 'analytics' });
User.hasMany(AdUnit, { foreignKey: 'createdBy', as: 'createdAdUnits' });
User.hasMany(AdPerformance, { foreignKey: 'userId', as: 'adPerformances' });

Book.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Book.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
Book.belongsTo(User, { foreignKey: 'publishedBy', as: 'publisherUser' });
Book.hasMany(Review, { foreignKey: 'bookId', as: 'reviews', onDelete: 'CASCADE' });
Book.hasMany(Purchase, { foreignKey: 'bookId', as: 'purchases', onDelete: 'CASCADE' });
Book.hasMany(Analytics, { foreignKey: 'bookId', as: 'analytics', onDelete: 'CASCADE' });
Book.hasMany(AdPerformance, { foreignKey: 'bookId', as: 'adPerformances' });
Book.belongsToMany(Category, {
  through: 'book_categories',
  foreignKey: 'bookId',
  otherKey: 'categoryId',
  as: 'categories_list'
});

Category.belongsToMany(Book, {
  through: 'book_categories',
  foreignKey: 'categoryId',
  otherKey: 'bookId',
  as: 'books'
});
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Purchase.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

Analytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Analytics.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

AdUnit.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
AdUnit.hasMany(AdPerformance, { foreignKey: 'adUnitId', as: 'performances', onDelete: 'CASCADE' });

AdPerformance.belongsTo(AdUnit, { foreignKey: 'adUnitId', as: 'adUnit' });
AdPerformance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Book,
  Category,
  Review,
  Purchase,
  Settings,
  Analytics,
  AdUnit,
  AdPerformance
};
