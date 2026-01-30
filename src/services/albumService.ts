import Album from '../models/Album';
import Artist from '../models/Artist';
import Song from '../models/Song';
import mongoose from 'mongoose';

/**
 * Lấy danh sách tất cả albums (public)
 * @param page - Số trang
 * @param limit - Số lượng items mỗi trang
 * @param sort - Sắp xếp: 'releaseDate' | 'title'
 */
export const getAllAlbums = async (page: number = 1, limit: number = 20, sort: string = 'releaseDate') => {
    const skip = (page - 1) * limit;
    const sortOption: any = {};

    if (sort === 'releaseDate') {
        sortOption.releaseDate = -1; // Mới nhất trước
    } else if (sort === 'title') {
        sortOption.title = 1; // A-Z
    }

    const albums = await Album.find()
        .populate('artist', 'artistName bio')
        .populate('songs', 'title duration')
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    const total = await Album.countDocuments();

    return {
        albums,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Lấy chi tiết album theo ID
 * @param albumId - ID của album
 */
export const getAlbumById = async (albumId: string) => {
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
        throw new Error('Invalid album ID');
    }

    const album = await Album.findById(albumId)
        .populate('artist', 'artistName bio userId')
        .populate({
            path: 'songs',
            populate: {
                path: 'artists',
                select: 'artistName'
            }
        });

    if (!album) {
        throw new Error('Album not found');
    }

    return album;
};

/**
 * Lấy danh sách albums của một nghệ sĩ
 * @param artistId - ID của nghệ sĩ
 */
export const getAlbumsByArtist = async (artistId: string) => {
    if (!mongoose.Types.ObjectId.isValid(artistId)) {
        throw new Error('Invalid artist ID');
    }

    const albums = await Album.find({ artist: artistId })
        .populate('artist', 'artistName')
        .populate('songs', 'title duration')
        .sort({ releaseDate: -1 });

    return albums;
};

/**
 * Lấy albums của nghệ sĩ hiện tại (dựa vào userId)
 * @param userId - ID của user (phải là nghệ sĩ)
 */
export const getMyAlbums = async (userId: string) => {
    // Tìm artist profile của user
    const artist = await Artist.findOne({ userId });
    if (!artist) {
        throw new Error('Artist profile not found. Please register as an artist first.');
    }

    const albums = await Album.find({ artist: artist._id })
        .populate('artist', 'artistName')
        .populate('songs', 'title duration coverImage')
        .sort({ releaseDate: -1 });

    return albums;
};

/**
 * Tạo album mới (chỉ nghệ sĩ)
 * @param userId - ID của user
 * @param data - Dữ liệu album
 */
export const createAlbum = async (userId: string, data: any) => {
    // Kiểm tra user có phải nghệ sĩ không
    const artist = await Artist.findOne({ userId });
    if (!artist) {
        throw new Error('Only artists can create albums. Please register as an artist first.');
    }

    if (artist.status !== 'active') {
        throw new Error('Your artist account is not active. Please wait for approval.');
    }

    // Tạo album mới
    const album = new Album({
        ...data,
        artist: artist._id,
        songs: [] // Bắt đầu với mảng rỗng
    });

    return await album.save();
};

/**
 * Cập nhật thông tin album
 * @param userId - ID của user
 * @param albumId - ID của album
 * @param data - Dữ liệu cập nhật
 */
import { deleteCloudinaryFile } from '../config/cloudinary';

export const updateAlbum = async (userId: string, albumId: string, data: any) => {
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
        throw new Error('Invalid album ID');
    }

    const album = await Album.findById(albumId).populate('artist');
    if (!album) {
        throw new Error('Album not found');
    }

    // Kiểm tra quyền sở hữu
    const artist = await Artist.findOne({ userId });
    if (!artist || album.artist._id.toString() !== artist._id.toString()) {
        throw new Error('Unauthorized: You can only update your own albums');
    }

    // Delete old cover image if new one provided
    if (data.coverImage && album.coverImage && data.coverImage !== album.coverImage) {
        await deleteCloudinaryFile(album.coverImage);
    }

    // Cập nhật các trường được phép
    const allowedFields = ['title', 'description', 'coverImage', 'releaseDate'];
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            (album as any)[field] = data[field];
        }
    });

    return await album.save();
};

export const deleteAlbum = async (userId: string, albumId: string) => {
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
        throw new Error('Invalid album ID');
    }

    const album = await Album.findById(albumId).populate('artist');
    if (!album) {
        throw new Error('Album not found');
    }

    // Kiểm tra quyền sở hữu
    const artist = await Artist.findOne({ userId });
    if (!artist || album.artist._id.toString() !== artist._id.toString()) {
        throw new Error('Unauthorized: You can only delete your own albums');
    }

    // Delete cover image
    if (album.coverImage) {
        await deleteCloudinaryFile(album.coverImage);
    }

    // Xóa album (không xóa bài hát)
    await Album.deleteOne({ _id: albumId });

    // TODO: Xóa albumId khỏi Favorite của tất cả users
    // Sẽ implement sau khi có FavoriteService hoàn chỉnh

    return { message: 'Album deleted successfully' };
};

/**
 * Thêm bài hát vào album
 * @param userId - ID của user
 * @param albumId - ID của album
 * @param songId - ID của bài hát
 */
export const addSongToAlbum = async (userId: string, albumId: string, songId: string) => {
    if (!mongoose.Types.ObjectId.isValid(albumId) || !mongoose.Types.ObjectId.isValid(songId)) {
        throw new Error('Invalid album or song ID');
    }

    const album = await Album.findById(albumId).populate('artist');
    if (!album) {
        throw new Error('Album not found');
    }

    // Kiểm tra quyền sở hữu album
    const artist = await Artist.findOne({ userId });
    if (!artist || album.artist._id.toString() !== artist._id.toString()) {
        throw new Error('Unauthorized: You can only modify your own albums');
    }

    // Kiểm tra bài hát có tồn tại không
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('Song not found');
    }

    // Kiểm tra bài hát có phải của nghệ sĩ này không
    const isSongByArtist = song.artists.some(
        (artistId: any) => artistId.toString() === artist._id.toString()
    );
    if (!isSongByArtist) {
        throw new Error('You can only add your own songs to your albums');
    }

    // Kiểm tra bài hát đã có trong album chưa
    if (album.songs.includes(songId as any)) {
        throw new Error('Song already exists in this album');
    }

    // Thêm bài hát vào album
    album.songs.push(songId as any);
    return await album.save();
};

/**
 * Xóa bài hát khỏi album
 * @param userId - ID của user
 * @param albumId - ID của album
 * @param songId - ID của bài hát
 */
export const removeSongFromAlbum = async (userId: string, albumId: string, songId: string) => {
    if (!mongoose.Types.ObjectId.isValid(albumId) || !mongoose.Types.ObjectId.isValid(songId)) {
        throw new Error('Invalid album or song ID');
    }

    const album = await Album.findById(albumId).populate('artist');
    if (!album) {
        throw new Error('Album not found');
    }

    // Kiểm tra quyền sở hữu
    const artist = await Artist.findOne({ userId });
    if (!artist || album.artist._id.toString() !== artist._id.toString()) {
        throw new Error('Unauthorized: You can only modify your own albums');
    }

    // Xóa bài hát khỏi album
    album.songs = album.songs.filter(sId => sId.toString() !== songId);
    return await album.save();
};
