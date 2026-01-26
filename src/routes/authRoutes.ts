import express from 'express';
import authController from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logoutUser);

export default router;
