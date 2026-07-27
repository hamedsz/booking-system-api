import { IS_DEBUG } from './app';

const databaseConf = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: IS_DEBUG,
    benchmark: IS_DEBUG,
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
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: IS_DEBUG,
    benchmark: IS_DEBUG,
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
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: IS_DEBUG,
    benchmark: IS_DEBUG,
    seederStorage: 'sequelize',
    define: {
      underscored: false,
    },
    pool: {
      max: 30,
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
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: IS_DEBUG,
    benchmark: IS_DEBUG,
    seederStorage: 'sequelize',
    define: {
      underscored: false,
    },
    pool: {
      max: 30,
      min: 0,
      acquire: 60000,
      idle: 20000,
    },
  },
  readonly: {
    username: process.env.DB_READONLY_USERNAME,
    password: process.env.DB_READONLY_PASSWORD,
    database: process.env.DB_READONLY_NAME,
    host: process.env.DB_READONLY_HOST,
    dialect: 'postgres',
    port: process.env.DB_READONLY_PORT,
  },
};

export default databaseConf;
