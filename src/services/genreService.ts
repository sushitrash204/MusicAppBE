import Genre from '../models/Genre';

export const createGenre = async (name: string, description?: string) => {
    if (!name) {
        throw new Error('Genre name is required');
    }
    const existingGenre = await Genre.findOne({ name });
    if (existingGenre) {
        throw new Error('Genre already exists');
    }

    const newGenre = new Genre({ name, description });
    return await newGenre.save();
};

export const getAllGenres = async () => {
    return await Genre.find().sort({ name: 1 });
};
