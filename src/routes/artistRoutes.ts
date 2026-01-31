import express from 'express';
import { createArtistRequest, getMyArtistProfile, getAllPendingRequests, approveArtistRequest, rejectArtistRequest, updateArtistProfile, getArtists, getArtistById } from '../controllers/artistController';
import { protect, admin, optionalProtect } from '../middlewares/authMiddleware';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';

const router = express.Router();

router.post('/request', protect, createArtistRequest);
router.get('/me', protect, getMyArtistProfile);
router.put('/me', protect, updateArtistProfile);
router.get('/', optionalProtect, cacheMiddleware(300), getArtists);

// Admin routes
router.get('/requests/pending', protect, admin, getAllPendingRequests);
router.put('/request/:id/approve', protect, admin, approveArtistRequest);
router.put('/request/:id/reject', protect, admin, rejectArtistRequest);

router.get('/:id', optionalProtect, getArtistById);

export default router;
