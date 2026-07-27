/* eslint-disable no-param-reassign */
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { NODE_ENV } from '../config/app';

const isProd = NODE_ENV === 'production';
const logsDir = path.join(__dirname, '../../logs'); // project root/logs
const instanceName = process.env.HOSTNAME || process.pid; // unique for each instance

export class CustomLogger {
  /**
   * Attemp to get the real instance of logger.
   *
   * @returns {Object}
   */
  instance() {
    if (!this.logger) {
      this.logger = this.create();
    }

    return this.logger;
  }

  /**
   * Change current logger default metadata.
   *
   * @param {String} [service='APP']
   * @param {String} [module='main']
   * @param {Object} [opts={}]
   *
   * @returns {Object}
   */
  service(service = 'APP', module = 'main', opts = {}) {
    const version = process.env.npm_package_version;
    const metadata = {
      serviceContext: { service, version },
      labels: { service, module, version },
      ...opts,
    };

    if (!this.logger) {
      this.logger = this.create();
    }

    this.logger.defaultMeta = metadata;

    return this;
  }

  /**
   * Create the logger with the provided metadata.
   *
   * @param {Object} [metadata={}]
   *
   * @returns {Object}
   */
  create(metadata = {}) {
    return createLogger({
      level: isProd ? 'info' : 'debug',
      exitOnError: false,
      transports: this.getTransports(),
      defaultMeta: { ...this.metadata, ...metadata },
    });
  }

  /**
   * Modified logger transports.
   *
   * @returns {Array}
   */
  getTransports() {
    if (!this.logTransports) {
      const logTransports = {
        console: this.createConsoleTransport(),
      };

      if (isProd) {
        logTransports.file = this.createFileTransport();
      }

      const env = process.env.ENABLE_LOGGING;
      const enabled = env === undefined ? true : parseInt(env, 10) === 1;

      Object.keys(logTransports).forEach((key) => {
        logTransports[key].silent = !enabled;
      });

      this.logTransports = Object.values(logTransports);
    }

    return this.logTransports;
  }

  /**
   * Craete console transport with custom options.
   *
   * @returns {transport.Console}
   */
  createConsoleTransport() {
    const consoleOpt = !isProd ? {
      json: true,
      colorize: true,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
      ),
    } : {
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    };

    return new transports.Console(consoleOpt);
  }

  createFileTransport() {
    return new transports.File({
      filename: path.join(logsDir, `app-${instanceName}.log`),
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    });
  }

  error(err, opts = {}) {
    if (err instanceof Error) {
      this.logger.log({ level: 'error', message: `${err.stack || err}`, ...opts });
    } else {
      this.logger.log({ level: 'error', message: err, ...opts });
    }
  }
}

// we will use Proxy here to use winstons Logger instance
// methods when we use e.g. Logger.info()
// which are not in our Logger's class.
const logger = new CustomLogger();
const handler = {
  get: (object, property) => {
    if (property in object) {
      return object[property];
    }

    return logger.instance()[property];
  },
};

export default new Proxy(logger, handler);
