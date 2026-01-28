import { Request, Response } from 'express';
import Artist from '../models/Artist';

// User requests to become an artist
export const createArtistRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id; // Assuming auth middleware adds user
        const { artistName, bio } = req.body;

        if (!artistName) {
            return res.status(400).json({ message: 'Artist name is required' });
        }

        const existingArtist = await Artist.findOne({ userId });
        if (existingArtist) {
            return res.status(400).json({ message: 'You have already submitted a request or are an artist.' });
        }

        const newArtist = new Artist({
            userId,
            artistName,
            bio,
            status: 'pending'
        });

        await newArtist.save();
        res.status(201).json({ message: 'Artist request submitted successfully', artist: newArtist });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user's artist profile
export const getMyArtistProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const artist = await Artist.findOne({ userId });
        if (!artist) {
            return res.status(404).json({ message: 'Artist profile not found' });
        }
        res.status(200).json(artist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// Get all pending artist requests (Admin only)
export const getAllPendingRequests = async (req: Request, res: Response) => {
    try {
        const requests = await Artist.find({ status: 'pending' }).populate('userId', 'fullName email avatar');
        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Approve an artist request
export const approveArtistRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const artist = await Artist.findById(id);

        if (!artist) {
            return res.status(404).json({ message: 'Artist request not found' });
        }

        artist.status = 'active';
        await artist.save();

        res.status(200).json({ message: 'Artist request approved', artist });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Reject an artist request
export const rejectArtistRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const artist = await Artist.findById(id);

        if (!artist) {
            return res.status(404).json({ message: 'Artist request not found' });
        }

        artist.status = 'rejected';
        await artist.save();

        res.status(200).json({ message: 'Artist request rejected', artist });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
