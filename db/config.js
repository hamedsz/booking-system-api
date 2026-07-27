require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: true,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    define: {
      underscored: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: true,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    define: {
      underscored: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    define: {
      underscored: false,
    },
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    define: {
      underscored: false,
    },
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      socketPath: process.env.DB_HOST,
    },
  },
};
