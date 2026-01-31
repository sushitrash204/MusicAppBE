import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from './config/database';
import uploadCloud from './config/cloudinary';
import { globalLimiter } from './middlewares/rateLimitMiddleware';

// Routes
import authRoutes from './routes/authRoutes';
import artistRoutes from './routes/artistRoutes';
import genreRoutes from './routes/genreRoutes';
import songRoutes from './routes/songRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import playlistRoutes from './routes/playlistRoutes';
import albumRoutes from './routes/albumRoutes';
import searchRoutes from './routes/searchRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Models for indexing
import Song from './models/Song';
import Artist from './models/Artist';
import Album from './models/Album';
import Playlist from './models/Playlist';

import { notFound, errorHandler } from './middlewares/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://music-web-smoky.vercel.app',
    'https://music-web-smoky-nghias-projects-d7d85bef.vercel.app' // Vercel preview domain
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Simple check: allow localhost or our production domain
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.startsWith('http://localhost');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS Blocked Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

// Connect to Database and Sync Indexes
connectDB().then(async () => {
    try {
        await Promise.all([
            Song.syncIndexes(),
            Artist.syncIndexes(),
            Album.syncIndexes(),
            Playlist.syncIndexes()
        ]);
        console.log('✅ Search Indexes Synced.');
    } catch (e) {
        console.error('Index Sync Error:', e);
    }
}).catch(err => {
    console.error('MongoDB connection failed:', err);
});

// Test Upload Route
app.post('/api/upload-test', uploadCloud.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
        message: 'File uploaded successfully',
        url: req.file.path,
        Details: req.file
    });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payment', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

cloudinary.api.ping()
    .then(result => console.log('Cloudinary connection status:', result.status))
    .catch(error => console.error('Cloudinary connection failed:', error.message));

export default app;
