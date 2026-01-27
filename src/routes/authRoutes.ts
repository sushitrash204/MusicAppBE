import express from 'express';
import authController from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

import { authLimiter, loginLimiter } from '../middlewares/rateLimitMiddleware';

const router = express.Router();

router.post('/register', authLimiter, authController.registerUser);
router.post('/login', authLimiter, loginLimiter, authController.loginUser);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logoutUser);

export default router;
