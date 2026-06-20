const { Sequelize } = require('sequelize');
require('dotenv').config();

// Using SQLite for immediate setup (no PostgreSQL installation needed)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: false,
    paranoid: false
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully using SQLite.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };