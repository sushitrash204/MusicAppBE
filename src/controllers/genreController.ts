import { Request, Response } from 'express';
import * as genreService from '../services/genreService';

export const createGenre = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const newGenre = await genreService.createGenre(name, description);
        res.status(201).json(newGenre);
    } catch (error: any) {
        if (error.message === 'Genre name is required' || error.message === 'Genre already exists') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

export const getAllGenres = async (req: Request, res: Response) => {
    try {
        const genres = await genreService.getAllGenres();
        res.status(200).json(genres);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
