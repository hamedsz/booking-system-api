import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { cache } from '../config/cache';
import RedisCache from '../core/cache/Redis';
import { diffDate } from '../utils/helper';

export const highLimiter = rateLimit({
  headers: false,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // limit each IP to 100 requests per windowMs
  keyGenerator(req) {
    return `${req.realIp}_${req.path}`;
  },
  handler(_req, res) {
    res.status(429).send({
      error: {
        status: 429,
        type: 'rate_limit_error',
        code: 'normal_limit',
        message: 'Too many requests',
      },
    });
  },
});

export const normalLimiter = rateLimit({
  headers: false,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1200, // limit each IP to 120 requests per windowMs
  keyGenerator(req) {
    return `${req.realIp}_${req.path}`;
  },
  handler(_req, res) {
    res.status(429).send({
      error: {
        status: 429,
        type: 'rate_limit_error',
        code: 'normal_limit',
        message: 'Too many requests',
      },
    });
  },
});

export const secureLimiter = rateLimit({
  headers: false,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 20 requests per windowMs
  keyGenerator(req) {
    return `${req.realIp}_${req.path}`;
  },
  handler(_req, res) {
    res.status(429).send({
      error: {
        status: 429,
        type: 'rate_limit_error',
        code: 'normal_limit',
        message: 'Too many requests',
      },
    });
  },
});

const redis = new RedisCache(cache.prefix, cache.clients.redis);

export const loginLimiter = rateLimit({
  headers: false,
  windowMs: 11 * 60 * 1e3, // 11 minutes
  max: 5, // 10 login attempts
  skipSuccessfulRequests: true,
  keyGenerator(req) {
    return `${req.body.phone}_${req.realIp}`;
  },
  store: new RedisStore({
    client: redis.getClient().store.getClient(),
    expiry: 11 * 60,
    prefix: 'login_limiter_',
  }),
  handler(req, res) {
    res.status(429).send({
      error: {
        status: 429,
        type: 'rate_limit_error',
        code: 'login_attempt_limit',
        message: `Too many login attempts, please try again after ${diffDate(req.rateLimit.resetTime, new Date())} minutes`,
      },
    });
  },
});
