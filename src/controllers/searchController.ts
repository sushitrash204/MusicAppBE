import { Request, Response } from 'express';
import Song from '../models/Song';
import Album from '../models/Album';
import Artist from '../models/Artist';
import Playlist from '../models/Playlist';

export const globalSearch = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json({
                songs: [],
                albums: [],
                artists: [],
                playlists: []
            });
        }

        const query = q as string;
        const regexQuery = { $regex: query, $options: 'i' };

        // Helper function to try text search first, fallback to regex
        const searchWithFallback = async (model: any, textFields: string[], filters: any = {}) => {
            try {
                // Try text search first
                const textResults = await model.find({
                    $text: { $search: query },
                    ...filters
                }).limit(10);

                if (textResults.length > 0) {
                    return textResults;
                }
            } catch (e) {
                // Text search failed, continue to regex
            }

            // Fallback to regex search
            const regexConditions = textFields.map(field => ({ [field]: regexQuery }));
            return await model.find({
                $or: regexConditions,
                ...filters
            }).limit(10);
        };

        const [songs, albums, artists, playlists] = await Promise.all([
            // Songs
            searchWithFallback(Song, ['title', 'lyrics'], { status: 'public' })
                .then(results => Song.populate(results, { path: 'artists', select: 'artistName' })),

            // Albums
            searchWithFallback(Album, ['title', 'description'])
                .then(results => Album.populate(results, { path: 'artist', select: 'artistName' })),

            // Artists
            searchWithFallback(Artist, ['artistName', 'bio'], { status: 'active' })
                .then(results => Artist.populate(results, { path: 'userId', select: 'avatar' })),

            // Playlists
            searchWithFallback(Playlist, ['title', 'description'], { isPublic: true })
                .then(results => Playlist.populate(results, { path: 'owner', select: 'fullName' }))
        ]);

        res.status(200).json({
            songs,
            albums,
            artists,
            playlists
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
