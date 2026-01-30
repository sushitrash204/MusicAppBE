import 'dotenv/config'; // Load env vars before other imports
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/database';
import uploadCloud from './config/cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import authRoutes from './routes/authRoutes';
import { notFound, errorHandler } from './middlewares/errorMiddleware';

// dotenv.config(); // Removed redundant call

const app = express();
const PORT = process.env.PORT || 3000;

import cors from 'cors';
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Rate Limiting
import { globalLimiter } from './middlewares/rateLimitMiddleware';
app.use(globalLimiter);

// Connect to Database
connectDB();

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

// Routes
import artistRoutes from './routes/artistRoutes';
import genreRoutes from './routes/genreRoutes';
import songRoutes from './routes/songRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import playlistRoutes from './routes/playlistRoutes';
import albumRoutes from './routes/albumRoutes';


app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/albums', albumRoutes);


// Middlewares
app.use(notFound);
app.use(errorHandler);

// Check Cloudinary Connection
cloudinary.api.ping()
    .then(result => console.log('Cloudinary connection status:', result.status))
    .catch(error => console.error('Cloudinary connection failed:', error.message));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
