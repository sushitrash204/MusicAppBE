import mongoose from 'mongoose';
import Song from '../models/Song';
import Artist from '../models/Artist';
import PlaySession from '../models/PlaySession';
import User from '../models/User';

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
        .select('title lyrics audioUrl coverImage duration plays createdAt artists previewStart')
        .lean(); // Use lean() for faster queries
};

// Get popular public songs by plays (optimized for homepage)
export const getPopularPublicSongs = async (limit: number = 10) => {
    return await Song.find({ status: 'public' })
        .sort({ plays: -1, createdAt: -1 })
        .limit(limit)
        .populate('artists', 'artistName')
        .select('title lyrics audioUrl coverImage duration plays createdAt artists previewStart')
        .lean();
};

// Get public songs by artist ID
export const getSongsByArtistId = async (artistId: string) => {
    return await Song.find({ artists: artistId, status: 'public' })
        .sort({ createdAt: -1 })
        .populate('artists', 'artistName')
        .select('title lyrics audioUrl coverImage duration plays createdAt artists previewStart')
        .lean();
};

export const getSongsByArtist = async (userId: string) => {
    if (!userId) {
        throw new Error('UserId is missing');
    }

    // Convert userId string to ObjectId for Artist query
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find artist by userId (as ObjectId)
    const artist = await Artist.findOne({ userId: userObjectId });

    if (!artist) {
        throw new Error('Artist profile not found.');
    }

    // Query songs where artists array contains the artist ID (as ObjectId)
    return await Song.find({ artists: artist._id })
        .sort({ createdAt: -1 })
        .populate('artists', 'artistName')
        .lean();
};

import { deleteCloudinaryFile } from '../config/cloudinary';

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

    // Delete old files if new ones are provided
    if (updateData.audioUrl && song.audioUrl && updateData.audioUrl !== song.audioUrl) {
        await deleteCloudinaryFile(song.audioUrl);
    }
    if (updateData.coverImage && song.coverImage && updateData.coverImage !== song.coverImage) {
        await deleteCloudinaryFile(song.coverImage);
    }

    // Parse arrays if they come as JSON strings
    if (updateData.artists) {
        updateData.artists = typeof updateData.artists === 'string' ? JSON.parse(updateData.artists) : updateData.artists;
    }
    if (updateData.genres) {
        updateData.genres = typeof updateData.genres === 'string' ? JSON.parse(updateData.genres) : updateData.genres;
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

    // Delete files from Cloudinary
    if (song.audioUrl) {
        await deleteCloudinaryFile(song.audioUrl);
    }
    if (song.coverImage) {
        await deleteCloudinaryFile(song.coverImage);
    }

    await Song.deleteOne({ _id: songId });

    // Remove song from any albums that contain it
    // Note: We need to import Album model, but circular dependency might be an issue if Album imports Song.
    // songService imports Album? No.
    // Let's use mongoose.model('Album') to avoid circular imports at top level if needed, 
    // or just import it if no cycle. SongService imports Artist. AlbumService imports Song.
    // Cycle: AlbumService -> Song -> ?
    // SongService doesn't import AlbumService.

    // Using mongoose.model to be safe or simple import.
    const Album = mongoose.model('Album');
    await Album.updateMany(
        { songs: songId },
        { $pull: { songs: songId } }
    );

    return { message: 'Song deleted successfully.' };
};

export const getSongById = async (id: string) => {
    return await Song.findById(id)
        .populate('artists', 'artistName')
        .populate('genres', 'name');
};

export const incrementPlayCount = async (songId: string) => {
    const song = await Song.findById(songId);
    if (!song) throw new Error('Song not found.');

    // Increment song plays
    song.plays = (song.plays || 0) + 1;
    await song.save();

    // Increment totalStreams for all artists of this song
    await Artist.updateMany(
        { _id: { $in: song.artists } },
        { $inc: { totalStreams: 1 } }
    );

    return song;
};

export const startPlaySession = async (userId: string, songId: string) => {
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) throw new Error('Song not found.');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found.');

    // --- Logic Bắt Buộc Xem Quảng Cáo ---
    // Chỉ áp dụng cho tài khoản thường (không phải Premium)
    if (!user.isPremium) {
        // Nếu số lượt nghe đã đạt ngưỡng (3 bài)
        if ((user.songsPlayedSinceLastAd || 0) >= 3) {
            const now = new Date();

            // Nếu đây là lần đầu chạm ngưỡng, lưu thời gian kích hoạt và chặn lại
            if (!user.lastAdTrigger) {
                user.lastAdTrigger = now;
                await user.save();
                throw new Error('AD_REQUIRED'); // Báo cho client biết cần hiện quảng cáo
            }

            // Kiểm tra thời gian đã trôi qua từ lúc kích hoạt
            const elapsedSeconds = (now.getTime() - user.lastAdTrigger.getTime()) / 1000;

            if (elapsedSeconds < 5) {
                throw new Error('AD_IN_PROGRESS'); // Vẫn đang trong thời gian chờ quảng cáo
            }

            // Nếu đã qua 5 giây, reset bộ đếm và cho phép nghe
            user.songsPlayedSinceLastAd = 0;
            user.lastAdTrigger = null;
            await user.save();
        } else {
            // Tăng số lượt nghe
            user.songsPlayedSinceLastAd = (user.songsPlayedSinceLastAd || 0) + 1;
            await user.save();
        }
    }
    // ----------------------------

    // Create a new pending session
    const session = new PlaySession({
        userId,
        songId,
        startTime: new Date(),
        status: 'pending'
    });

    await session.save();
    return session._id;
};

const PLAY_COUNT_THRESHOLD = 30; // 30 seconds required for a valid play

export const confirmPlaySession = async (userId: string, sessionId: string) => {
    const session = await PlaySession.findById(sessionId);

    if (!session) throw new Error('Session not found or expired.');
    if (session.userId.toString() !== userId.toString()) throw new Error('Unauthorized session.');
    if (session.status !== 'pending') throw new Error('Session already processed.');

    // Validate time: must be at least 30 seconds since start
    const now = new Date();
    const elapsedSeconds = (now.getTime() - session.startTime.getTime()) / 1000;

    if (elapsedSeconds < PLAY_COUNT_THRESHOLD) {
        throw new Error(`Song played for less than ${PLAY_COUNT_THRESHOLD} seconds. Potential fraud detected.`);
    }

    // Session is valid. Update song and artist counts.
    const song = await Song.findById(session.songId);
    if (!song) throw new Error('Song not found.');

    song.plays = (song.plays || 0) + 1;
    await song.save();

    await Artist.updateMany(
        { _id: { $in: song.artists } },
        { $inc: { totalStreams: 1 } }
    );

    // Mark session as completed
    session.status = 'completed';
    await session.save();

    return { success: true, plays: song.plays };
};
