import { Router } from 'express';
import { normalLimiter } from '../middlewares/ratelimiter';
import BookingHandler from '../handlers/BookingHandler';
import authorization from '../middlewares/authorization';

const router = Router();

/**
 * @openapi
 * /bookings:
 *   post:
 *     description: Create a booking
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentorId:
 *                 type: string
 *               startDateTime:
 *                 type: string
 *               endDateTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created booking
 *     security:
 *       - bearerAuth: []
 */
router.post('/', normalLimiter, authorization, async (req, res, next) => {
  try {
    res.locals.data = await BookingHandler.createBooking(req);
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /bookings:
 *   get:
 *     description: Get list of user bookings
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved user bookings
 *     security:
 *       - bearerAuth: []
 */
router.get('/', normalLimiter, authorization, async (req, res, next) => {
  try {
    res.locals.data = await BookingHandler.list(req);
    next();
  } catch (e) {
    next(e);
  }
});

export default router;
