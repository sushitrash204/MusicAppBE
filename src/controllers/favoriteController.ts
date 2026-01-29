import { Request, Response } from 'express';
import * as favoriteService from '../services/favoriteService';

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const favorites = await favoriteService.getFavorites(userId);
        res.status(200).json(favorites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleFavoriteSong = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { songId } = req.body;
        const favorites = await favoriteService.toggleFavoriteSong(userId, songId);
        res.status(200).json(favorites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleFavoriteAlbum = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { albumId } = req.body;
        const favorites = await favoriteService.toggleFavoriteAlbum(userId, albumId);
        res.status(200).json(favorites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleFavoritePlaylist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { playlistId } = req.body;
        const favorites = await favoriteService.toggleFavoritePlaylist(userId, playlistId);
        res.status(200).json(favorites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const followArtist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { artistId } = req.body;
        const favorites = await favoriteService.followArtist(userId, artistId);
        res.status(200).json(favorites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
