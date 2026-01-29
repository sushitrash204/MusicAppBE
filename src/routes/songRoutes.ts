import express from 'express';
import { createSong, getMySongs, updateSong, deleteSong, getRecentSongs, getSongsByArtistId } from '../controllers/songController';
import { protect } from '../middlewares/authMiddleware';
import uploadCloud from '../config/cloudinary';

const router = express.Router();

// Public routes
router.get('/recent', getRecentSongs); // No auth required for homepage
router.get('/artist/:artistId', getSongsByArtistId); // Public artist songs

// Song CRUD with file upload
router.post('/', protect, uploadCloud.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), createSong);

router.get('/my-songs', protect, getMySongs);
router.put('/:id', protect, updateSong);
router.delete('/:id', protect, deleteSong);

export default router;
