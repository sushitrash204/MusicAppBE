import { Request, Response } from 'express';
import * as songService from '../services/songService';

// Create a new song with file uploads
export const createSong = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Logs removed for cleanliness

        // Extract file URLs from multer/cloudinary
        const audioUrl = files?.audio?.[0]?.path || '';
        const coverImage = files?.cover?.[0]?.path || '';

        if (!audioUrl) {
            console.error('No audio file found in request');
            return res.status(400).json({
                message: 'Audio file is required',
                debug: {
                    hasFiles: !!files,
                    fileKeys: files ? Object.keys(files) : [],
                    audioExists: !!files?.audio
                }
            });
        }

        const songData = {
            ...req.body,
            audioUrl,
            coverImage
        };

        const newSong = await songService.createSong(userId, songData);
        res.status(201).json(newSong);
    } catch (error: any) {
        console.error('Create song error:', error);
        if (error.message === 'Only artists can add songs.') {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Get recent public songs (for homepage)
export const getRecentSongs = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const songs = await songService.getRecentPublicSongs(limit);
        res.status(200).json(songs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get popular public songs (for homepage)
export const getPopularSongs = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const songs = await songService.getPopularPublicSongs(limit);
        res.status(200).json(songs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get public songs by artist ID (for artist profile)
export const getSongsByArtistId = async (req: Request, res: Response) => {
    try {
        const { artistId } = req.params;
        const songs = await songService.getSongsByArtistId(artistId as string);
        res.status(200).json(songs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get songs by current artist
export const getMySongs = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const songs = await songService.getSongsByArtist(userId);
        res.status(200).json(songs);
    } catch (error: any) {
        if (error.message === 'Artist profile not found.') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Internal Server Error' });
        }
    }
};

// Update a song
export const updateSong = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const updateData = { ...req.body };

        if (files?.audio?.[0]?.path) {
            updateData.audioUrl = files.audio[0].path;
        }
        if (files?.cover?.[0]?.path) {
            updateData.coverImage = files.cover[0].path;
        }

        const updatedSong = await songService.updateSong(userId, id as string, updateData);
        res.status(200).json(updatedSong);
    } catch (error: any) {
        if (error.message === 'Song not found.') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'Access denied.' || error.message === 'You can only edit your own songs.') {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Delete a song
export const deleteSong = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;
        await songService.deleteSong(userId, id as string);
        res.status(200).json({ message: 'Song deleted successfully.' });
    } catch (error: any) {
        if (error.message === 'Song not found.') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'Access denied.' || error.message === 'You can only delete your own songs.') {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

export const getSongById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const song = await songService.getSongById(id as string);
        if (!song) {
            return res.status(404).json({ message: 'Song not found.' });
        }
        res.status(200).json(song);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const initPlay = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { id: songId } = req.params;
        const sessionId = await songService.startPlaySession(userId, songId as string);
        res.status(200).json({ sessionId });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const confirmPlay = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { sessionId } = req.params;
        const result = await songService.confirmPlaySession(userId, sessionId as string);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message.includes('fraud detected')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};
