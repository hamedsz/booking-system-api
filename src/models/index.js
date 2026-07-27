import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { Sequelize, DataTypes } from 'sequelize';
import databaseConfig from '../config/database';
import { NODE_ENV } from '../config/app';

const basename = path.basename(__filename);
const config = databaseConfig[NODE_ENV];
const readonlyConfig = databaseConfig.readonly;
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

const readonlySequelize = new Sequelize(
  readonlyConfig.database,
  readonlyConfig.username,
  readonlyConfig.password,
  readonlyConfig,
);

fs.readdirSync(__dirname)
  .filter((file) => (
    file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  ))
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const def = require(path.join(__dirname, file)).default;
    const model = def(sequelize, DataTypes);

    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { Sequelize };
export { sequelize as sq };
export { readonlySequelize as readonlySq };
/**
 * SHIM: Sequlize return DECIMAL as string.
 * this to convert it to float
 */
Sequelize.postgres.DECIMAL.parse = function decimal(value) {
  return parseFloat(value);
};

pg.defaults.parseInt8 = true;

export default db;
