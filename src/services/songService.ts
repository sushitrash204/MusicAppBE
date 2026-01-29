import Song from '../models/Song';
import Artist from '../models/Artist';

export const createSong = async (userId: string, songData: any) => {
    const artist = await Artist.findOne({ userId });
    if (!artist) {
        throw new Error('Only artists can add songs.');
    }

    const {
        title, lyrics, audioUrl, coverImage, duration, genres,
        previewStart, artists, status
    } = songData;

    // Parse arrays if they come as JSON strings (from FormData)
    const artistIds = typeof artists === 'string' ? JSON.parse(artists) : (artists || []);
    const genreIds = typeof genres === 'string' ? JSON.parse(genres) : (genres || []);

    // Ensure current artist is included
    if (!artistIds.includes(artist._id.toString())) {
        artistIds.push(artist._id.toString());
    }

    const newSong = new Song({
        title,
        lyrics,
        audioUrl,
        coverImage: coverImage || '',
        duration: duration || 0,
        previewStart: previewStart || 30,
        genres: genreIds,
        artists: artistIds,
        status: status || 'public'
    });

    return await newSong.save();
};

// Get recent public songs with limit (optimized for homepage)
export const getRecentPublicSongs = async (limit: number = 10) => {
    return await Song.find({ status: 'public' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('artists', 'artistName')
        .select('title audioUrl coverImage duration plays createdAt artists previewStart')
        .lean(); // Use lean() for faster queries
};

// Get public songs by artist ID
export const getSongsByArtistId = async (artistId: string) => {
    return await Song.find({ artists: artistId, status: 'public' })
        .sort({ createdAt: -1 })
        .populate('artists', 'artistName')
        .select('title audioUrl coverImage duration plays createdAt artists previewStart')
        .lean();
};

export const getSongsByArtist = async (userId: string) => {
    const artist = await Artist.findOne({ userId });
    if (!artist) {
        throw new Error('Artist profile not found.');
    }
    return await Song.find({ artists: artist._id }).sort({ createdAt: -1 });
};

export const updateSong = async (userId: string, songId: string, updateData: any) => {
    const artist = await Artist.findOne({ userId });
    if (!artist) {
        throw new Error('Access denied.');
    }

    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('Song not found.');
    }

    const isOwner = song.artists.some((aId) => aId.toString() === artist._id.toString());
    if (!isOwner) {
        throw new Error('You can only edit your own songs.');
    }

    Object.assign(song, updateData);
    return await song.save();
};

export const deleteSong = async (userId: string, songId: string) => {
    const artist = await Artist.findOne({ userId });
    if (!artist) {
        throw new Error('Access denied.');
    }

    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('Song not found.');
    }

    const isOwner = song.artists.some((aId) => aId.toString() === artist._id.toString());
    if (!isOwner) {
        throw new Error('You can only delete your own songs.');
    }

    await Song.deleteOne({ _id: songId });
    return { message: 'Song deleted successfully.' };
};
