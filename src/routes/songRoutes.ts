import express from 'express';
import { createSong, getMySongs, updateSong, deleteSong, getRecentSongs, getPopularSongs, getSongsByArtistId, getSongById, initPlay, confirmPlay } from '../controllers/songController';
import { protect } from '../middlewares/authMiddleware';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';
import uploadCloud from '../config/cloudinary';

const router = express.Router();

// Public routes
router.get('/recent', cacheMiddleware(300), getRecentSongs); // No auth required for homepage
router.get('/popular', cacheMiddleware(300), getPopularSongs); // No auth required for homepage
router.get('/my-songs', protect, getMySongs); // Auth required, specific path BEFORE generic :id
router.get('/artist/:artistId', getSongsByArtistId); // Public artist songs
router.get('/:id', getSongById);
router.post('/:id/start-play', protect, initPlay);
router.post('/confirm-play/:sessionId', protect, confirmPlay);

// Song CRUD with file upload
router.post('/', protect, uploadCloud.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), createSong);

router.put('/:id', protect, uploadCloud.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), updateSong);
router.delete('/:id', protect, deleteSong);

export default router;
