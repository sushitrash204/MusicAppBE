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

// Update current user's artist profile
export const updateArtistProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { artistName, bio } = req.body;

        const artist = await Artist.findOne({ userId });
        if (!artist) {
            return res.status(404).json({ message: 'Artist profile not found' });
        }

        if (artistName) artist.artistName = artistName;
        if (bio !== undefined) artist.bio = bio;

        await artist.save();
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

// Get 10 random active artists (public)
export const getArtists = async (req: Request, res: Response) => {
    try {
        const artists = await Artist.aggregate([
            { $match: { status: 'active' } },
            { $sample: { size: 10 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 1,
                    artistName: 1,
                    bio: 1,
                    userId: {
                        fullName: '$userInfo.fullName',
                        avatar: '$userInfo.avatar'
                    }
                }
            }
        ]);
        res.status(200).json(artists);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get artist by ID (public)
export const getArtistById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log('Backend: getArtistById called with ID:', id);

        const artist = await Artist.findById(id).populate('userId', 'fullName avatar');

        if (!artist) {
            console.log('Backend: Artist not found for ID:', id);
            return res.status(404).json({ message: 'Artist not found' });
        }

        console.log('Backend: Artist found:', artist._id);
        res.status(200).json(artist);
    } catch (error: any) {
        console.error('Backend: getArtistById error:', error);
        res.status(500).json({ message: error.message });
    }
};
