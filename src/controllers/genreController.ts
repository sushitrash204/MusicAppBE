import { Request, Response } from 'express';
import Genre from '../models/Genre';

export const createGenre = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Genre name is required' });
        }
        const existingGenre = await Genre.findOne({ name });
        if (existingGenre) {
            return res.status(400).json({ message: 'Genre already exists' });
        }

        const newGenre = new Genre({ name, description });
        await newGenre.save();

        res.status(201).json(newGenre);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllGenres = async (req: Request, res: Response) => {
    try {
        const genres = await Genre.find().sort({ name: 1 });
        res.status(200).json(genres);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
