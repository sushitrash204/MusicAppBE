import { Request, Response } from 'express';
import * as albumService from '../services/albumService';

/**
 * Lấy danh sách tất cả albums
 * GET /api/albums?page=1&limit=20&sort=releaseDate
 */
export const getAllAlbums = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const sort = (req.query.sort as string) || 'releaseDate';

        const result = await albumService.getAllAlbums(page, limit, sort);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy chi tiết album theo ID
 * GET /api/albums/:id
 */
export const getAlbumById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const album = await albumService.getAlbumById(id);
        res.status(200).json(album);
    } catch (error: any) {
        if (error.message === 'Album not found' || error.message === 'Invalid album ID') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy albums của một nghệ sĩ
 * GET /api/albums/artist/:artistId
 */
export const getAlbumsByArtist = async (req: Request, res: Response) => {
    try {
        const artistId = req.params.artistId as string;
        const albums = await albumService.getAlbumsByArtist(artistId);
        res.status(200).json(albums);
    } catch (error: any) {
        if (error.message === 'Invalid artist ID') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy albums của nghệ sĩ hiện tại
 * GET /api/albums/my
 */
export const getMyAlbums = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const albums = await albumService.getMyAlbums(userId);
        res.status(200).json(albums);
    } catch (error: any) {
        if (error.message.includes('Artist profile not found')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Tạo album mới (chỉ nghệ sĩ)
 * POST /api/albums
 */
export const createAlbum = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const albumData = { ...req.body };
        if (req.file) {
            albumData.coverImage = req.file.path;
        }

        const album = await albumService.createAlbum(userId, albumData);
        res.status(201).json(album);
    } catch (error: any) {
        if (error.message.includes('Only artists') || error.message.includes('not active')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Cập nhật album
 * PUT /api/albums/:id
 */
export const updateAlbum = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const id = req.params.id as string;
        const album = await albumService.updateAlbum(userId, id, req.body);
        res.status(200).json(album);
    } catch (error: any) {
        if (error.message === 'Album not found' || error.message === 'Invalid album ID') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Xóa album
 * DELETE /api/albums/:id
 */
export const deleteAlbum = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const id = req.params.id as string;
        const result = await albumService.deleteAlbum(userId, id);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Album not found' || error.message === 'Invalid album ID') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Thêm bài hát vào album
 * POST /api/albums/add-song
 */
export const addSongToAlbum = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { albumId, songId } = req.body;

        if (!albumId || !songId) {
            return res.status(400).json({ message: 'albumId and songId are required' });
        }

        const album = await albumService.addSongToAlbum(userId, albumId, songId);
        res.status(200).json(album);
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized') || error.message.includes('only add your own')) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes('already exists')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Xóa bài hát khỏi album
 * POST /api/albums/remove-song
 */
export const removeSongFromAlbum = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { albumId, songId } = req.body;

        if (!albumId || !songId) {
            return res.status(400).json({ message: 'albumId and songId are required' });
        }

        const album = await albumService.removeSongFromAlbum(userId, albumId, songId);
        res.status(200).json(album);
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};
