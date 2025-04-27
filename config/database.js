const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'editorjs',
  username: 'admin',
  password: 'admin',
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Disable logging in production
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Security best practices
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
  }
});

module.exports = { sequelize };