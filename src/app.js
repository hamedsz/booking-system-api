import 'dotenv/config';
import './config/validator';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import baseRouter from './routes/index';
import { NODE_ENV } from './config/app';
import { init } from './core/sentry';

const IS_LOCAL = NODE_ENV === 'local';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
init();

// --- Middleware Configuration ---
app.use(helmet.contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: ['\'self\' \'unsafe-inline\''],
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
      return false;
    }
    return compression.filter(req, res);
  },
}));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- Swagger Configuration ---
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
  apis: [
    `${path.dirname(__filename)}/routes/*.js`,
    `${path.dirname(__filename)}/routes/*/*.js`,
    `${path.dirname(__filename)}/routes/*/*/*.js`,
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- Base Routes ---
app.use('/', baseRouter);

// Export the pure express app instance for Jest/Supertest
export default app;
