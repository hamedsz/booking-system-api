import { Router } from 'express';
import { normalLimiter } from '../middlewares/ratelimiter';
import MentorHandler from '../handlers/MentorHandler';
import authorization from '../middlewares/authorization';
import BookingHandler from '../handlers/BookingHandler';

const router = Router();

/**
 * @openapi
 * /mentors:
 *   get:
 *     description: Get list mentors
 *     tags:
 *       - Mentors
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
 *         description: Successfully get mentors
 *     security:
 *       - bearerAuth: []
 */
router.get('/', normalLimiter, authorization, async (req, res, next) => {
  try {
    res.locals.data = await MentorHandler.list(req);
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /mentors/{mentorId}/availablities:
 *   get:
 *     description: Get availablities for a mentor
 *     tags:
 *       - Mentors
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: from
 *         schema:
 *           type: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: date
 *     responses:
 *       200:
 *         description: Successfully get mentors
 *     security:
 *       - bearerAuth: []
 */
router.get('/:mentorId/availablities', normalLimiter, authorization, async (req, res, next) => {
  try {
    res.locals.data = await BookingHandler.availablities(req);
    next();
  } catch (e) {
    next(e);
  }
});

export default router;
