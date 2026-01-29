import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import Artist from '../models/Artist';
import connectDB from '../config/database';
import bcrypt from 'bcryptjs';

const artistNames = [
    'The Weeknd', 'Taylor Swift', 'Drake', 'Bad Bunny', 'Ed Sheeran',
    'Ariana Grande', 'Justin Bieber', 'Post Malone', 'Eminem', 'Dua Lipa',
    'Coldplay', 'Imagine Dragons', 'Bruno Mars', 'Billie Eilish', 'Rihanna'
];

const seedArtists = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Optional: Clear existing artists/users related to seeding if desired
        // But for now, let's just create new unique ones to avoid collisions or just simple ones.
        // We will append a timestamp or random string to username to ensure uniqueness.

        console.log('Seeding 15 active artists...');

        for (let i = 0; i < artistNames.length; i++) {
            const name = artistNames[i];
            const username = `artist_seed_${i}_${Date.now()}`;
            const email = `artist_seed_${i}_${Date.now()}@example.com`;

            // 1. Create User
            // Note: Password hashing is handled in pre-save hook of User model, but we can also just provide a hardcoded hashed one or plain text if hook handles it.
            // The User model hook checks if isModified('password').
            // Let's create user instance.

            // To ensure avatars are interesting, we can use a service or just default.
            // Using UI Avatars for initals style if default is not enough, but default is generic.
            // Let's use generic placeholder or just leave default.

            const user = await User.create({
                fullName: name,
                username: username,
                emails: [email],
                password: 'password123', // Will be hashed by hook
                role: 'user', // Artists are users with additional Artist profile
                isPremium: true
            });

            // 2. Create Artist Profile
            await Artist.create({
                userId: user._id,
                artistName: name,
                bio: `This is the bio for ${name}. One of the seeded active artists.`,
                status: 'active',
                totalStreams: Math.floor(Math.random() * 1000000),
                followers: Math.floor(Math.random() * 500000)
            });

            console.log(`Created artist: ${name}`);
        }

        console.log('Successfully seeded 15 artists!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding artists:', error);
        process.exit(1);
    }
};

seedArtists();
