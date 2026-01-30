import express from 'express';
import * as albumController from '../controllers/albumController';
import { protect } from '../middlewares/authMiddleware';
import uploadCloud from '../config/cloudinary';

const router = express.Router();

// Public Routes
router.get('/', albumController.getAllAlbums);
router.get('/artist/:artistId', albumController.getAlbumsByArtist);

// Protected Routes (Specific paths first)
router.get('/my/albums', protect, albumController.getMyAlbums);

// Public Detail Route (Generic param - must be after specific paths)
router.get('/:id', albumController.getAlbumById);

// Protected Mutations
router.post('/', protect, uploadCloud.single('coverImage'), albumController.createAlbum);
router.put('/:id', protect, albumController.updateAlbum);
router.delete('/:id', protect, albumController.deleteAlbum);

// Song Management in Album (Protected)
router.post('/add-song', protect, albumController.addSongToAlbum);
router.post('/remove-song', protect, albumController.removeSongFromAlbum);

export default router;
