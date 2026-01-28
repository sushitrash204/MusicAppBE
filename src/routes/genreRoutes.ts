import express from 'express';
import { createGenre, getAllGenres } from '../controllers/genreController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getAllGenres);
router.post('/', protect, admin, createGenre); // Only admin can create genres

export default router;
