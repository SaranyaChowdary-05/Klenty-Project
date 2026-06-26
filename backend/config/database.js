const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize = null;
let useJsonFallback = false;

const connectDB = async () => {
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'sprinthub_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      }
    );
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
    return { sequelize, useJsonFallback: false };
  } catch (error) {
    console.warn('⚠️  MySQL not available, using JSON fallback store');
    useJsonFallback = true;
    return { sequelize: null, useJsonFallback: true };
  }
};

module.exports = {
  connectDB,
  getSequelize: () => sequelize,
  isJsonFallback: () => useJsonFallback
};
