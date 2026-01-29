import { Request, Response } from 'express';
import * as playlistService from '../services/playlistService';

export const createPlaylist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const playlist = await playlistService.createPlaylist(userId, req.body);
        res.status(201).json(playlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyPlaylists = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const playlists = await playlistService.getMyPlaylists(userId);
        res.status(200).json(playlists);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPlaylistById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const playlist = await playlistService.getPlaylistById(id as string);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        res.status(200).json(playlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePlaylist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { id } = req.params;
        const playlist = await playlistService.updatePlaylist(userId, id as string, req.body);
        res.status(200).json(playlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePlaylist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { id } = req.params;
        await playlistService.deletePlaylist(userId, id as string);
        res.status(200).json({ message: 'Playlist deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addSong = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { playlistId, songId } = req.body;
        const playlist = await playlistService.addSongToPlaylist(userId, playlistId, songId);
        res.status(200).json(playlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeSong = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { playlistId, songId } = req.body;
        const playlist = await playlistService.removeSongFromPlaylist(userId, playlistId, songId);
        res.status(200).json(playlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
