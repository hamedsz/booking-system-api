import { Router } from 'express';
import UserHandler from '../handlers/UserHandler';
import { secureLimiter } from '../middlewares/ratelimiter';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
router.post('/login', secureLimiter, async (req, res, next) => {
  try {
    res.locals.data = await UserHandler.login(req);
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     description: Refresh Token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully reset token
 */
router.post('/refresh', secureLimiter, async (req, res, next) => {
  try {
    res.locals.data = await UserHandler.refreshToken(req);
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     description: Register new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully reset token
 */
router.post('/register', secureLimiter, async (req, res, next) => {
  try {
    res.locals.data = await UserHandler.register(req);
    next();
  } catch (e) {
    next(e);
  }
});

export default router;
