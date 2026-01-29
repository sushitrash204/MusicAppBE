import express from 'express';
import { getFavorites, toggleFavoriteSong, toggleFavoriteAlbum, toggleFavoritePlaylist, followArtist } from '../controllers/favoriteController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/song', protect, toggleFavoriteSong);
router.post('/album', protect, toggleFavoriteAlbum);
router.post('/playlist', protect, toggleFavoritePlaylist);
router.post('/artist', protect, followArtist);

export default router;
