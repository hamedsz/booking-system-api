import { Router } from 'express';
import cors from 'cors';
import errorHandler from '../middlewares/errorHandler';
import okResponse from '../middlewares/okResponse';
import notFoundHandler from '../middlewares/notFoundHandler';

// Routes
import authRoutes from './auth';
import mentorRoutes from './mentors';
import bookingRoutes from './bookings';

import { CORS_ALLOWED_DOMAINS } from '../config/app';

const router = Router({
  strict: true,
  caseSensitive: true,
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed domains
    if (CORS_ALLOWED_DOMAINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
    return 1;
  },
  credentials: true,
};

router.use(cors(corsOptions));
router.get('/healthcheck', async (req, res, next) => {
  try {
    res.locals.data = { ok: true };
    next();
  } catch (e) {
    next(e);
  }
});

// Web routes
router.use('/auth', authRoutes);
router.use('/mentors', mentorRoutes);
router.use('/bookings', bookingRoutes);

// After response middlewares
router.use(notFoundHandler);
router.use(okResponse);
router.use(errorHandler);

export default router;
