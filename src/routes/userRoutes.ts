import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { updateUserProfile, getUserProfile } from '../controllers/userController';
import uploadCloud from '../config/cloudinary';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, uploadCloud.single('avatar'), updateUserProfile);

export default router;
