const { Sequelize } = require('sequelize');
require('dotenv').config();

// For Railway deployment, use the DATABASE_URL if provided
let sequelize;

if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  // Railway provides a DATABASE_URL for MySQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  console.log('Using individual connection parameters');
  // Use individual parameters for local development
  sequelize = new Sequelize(
    process.env.DB_NAME || 'anonstore',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize; 