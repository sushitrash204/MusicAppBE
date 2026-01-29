import express from 'express';
import { createPlaylist, getMyPlaylists, getPlaylistById, updatePlaylist, deletePlaylist, addSong, removeSong } from '../controllers/playlistController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, createPlaylist);
router.get('/me', protect, getMyPlaylists);
router.get('/:id', getPlaylistById);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/add-song', protect, addSong);
router.post('/remove-song', protect, removeSong);

export default router;
