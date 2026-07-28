import http from 'http';
import app from './app';
import cache from './core/Cache';
import Logger from './core/Logger';
import { sq } from './models';
import { PORT } from './config/app';

const logger = Logger.service('APP');

const startServer = async () => {
  // 1. Establish Cache Diagnostics
  cache.on('connect', () => {
    logger.info('Cache connection has been established successfully.');
  });

  cache.on('error', (err) => {
    logger.error('Unable to connect to redis', err);
  });

  // 2. Establish Database Connection
  try {
    await sq.authenticate();
    logger.info('Database Connection has been established successfully.');
  } catch (err) {
    logger.error('Unable to connect to the database', err);
    process.exit(1); // Force failure if the database cannot be hit on launch
  }

  // 3. Bind App to HTTP Server and Listen
  try {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (e) {
    logger.error('Unable to start server', e);
    throw e;
  }
};

startServer();
