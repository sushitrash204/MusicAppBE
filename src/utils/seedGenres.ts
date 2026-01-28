import 'dotenv/config';
import mongoose from 'mongoose';
import Genre from '../models/Genre';
import connectDB from '../config/database';

const genres = [
    { name: 'Pop', description: 'Popular music' },
    { name: 'Rock', description: 'Rock music' },
    { name: 'Ballad', description: 'Slow, sentimental songs' },
    { name: 'R&B', description: 'Rhythm and Blues' },
    { name: 'Hip-Hop', description: 'Hip hop music' },
    { name: 'Indie', description: 'Independent music' },
    { name: 'EDM', description: 'Electronic Dance Music' },
    { name: 'Jazz', description: 'Jazz music' },
    { name: 'Country', description: 'Country music' },
    { name: 'Classical', description: 'Classical music' }
];

const seedGenres = async () => {
    try {
        await connectDB();

        console.log('Clearing existing genres...');
        await Genre.deleteMany({});

        console.log('Inserting new genres...');
        await Genre.insertMany(genres);

        console.log('Genres seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding genres:', error);
        process.exit(1);
    }
};

seedGenres();
