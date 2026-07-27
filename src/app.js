import 'dotenv/config';
import './config/validator';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cache from './core/Cache';
import baseRouter from './routes/index';
import { PORT, NODE_ENV } from './config/app';
import Logger from './core/Logger';
import { sq } from './models';
import { init } from './core/sentry';

const run = async () => {
  const IS_LOCAL = NODE_ENV === 'local';
  const logger = Logger.service('APP');

  cache.on('connect', () => {
    logger.info('Cache connection has been established successfully.');
  });

  cache.on('error', (err) => {
    logger.error('Unable to connect to redis', err);
  });
  sq
    .authenticate()
    .then(() => {
      logger.info('Database Connection has been established successfully.');
    })
    .catch((err) => {
      logger.error('Unable to connect to the database', err);
    });

  try {
    const app = express();
    const server = http.createServer(app);

    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    init();

    app.use(helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: ['\'self\' \'unsafe-inline\''], // use unsafe-inline for swagger (only in none production environment
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: [],
      },
    }));
    app.use(helmet.hidePoweredBy());
    if (!IS_LOCAL) {
      app.use(helmet.hsts());
    }
    app.use(helmet.noSniff());
    app.use(helmet.xssFilter());
    app.use(helmet.frameguard());
    app.use(helmet.referrerPolicy({
      policy: ['no-referrer'],
    }));

    app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          // don't compress responses with this request header
          return false;
        }

        // fallback to standard filter function
        return compression.filter(req, res);
      },
    }));

    app.use(cookieParser());

    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Express API with Swagger',
          version: '1.0.0',
          description: 'This is a sample server for Express API with Swagger',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: [`${path.dirname(__filename)}/routes/*.js`, `${path.dirname(__filename)}/routes/*/*.js`, `${path.dirname(__filename)}/routes/*/*/*.js`], // Path to the API routes
    };

    const swaggerDocs = swaggerJsdoc(swaggerOptions);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    app.use('/', baseRouter);

    server.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (e) {
    logger.error('Unable to start server', e);

    throw e;
  }
};

run();
