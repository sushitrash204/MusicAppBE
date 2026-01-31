
// Basic script to test search logic directly
// Run with: npx ts-node src/scripts/test_search.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from '../models/Song';
import Artist from '../models/Artist';
import Album from '../models/Album';
import Playlist from '../models/Playlist';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'your_mongo_uri_here';

const runTest = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoURI);
        console.log('Connected to:', mongoURI.split('@')[1]); // Log DB host to confirm correctness

        // 1. Check Specific Artist Status
        console.log('\n--- HEADS UP: Checking "Bryant Barnes" Status ---');
        const specific = await Artist.findOne({ artistName: { $regex: 'Bryant', $options: 'i' } });
        if (specific) {
            console.log(`FOUND: "${specific.artistName}"`);
            console.log(`STATUS: ${specific.status}`); // 'pending' vs 'active'
            console.log(`ID: ${specific._id}`);
        } else {
            console.log('NOT FOUND: Bryant Barnes');
        }

        // 2. Check Text Indexes
        console.log('\n--- Checking Indexes ---');
        const sIdx = await Song.collection.getIndexes();
        console.log('Song Indexes:', Object.keys(sIdx));
        const aIdx = await Artist.collection.getIndexes();
        console.log('Artist Indexes:', Object.keys(aIdx));
        const alIdx = await Album.collection.getIndexes();
        console.log('Album Indexes:', Object.keys(alIdx));
        const pIdx = await Playlist.collection.getIndexes();
        console.log('Playlist Indexes:', Object.keys(pIdx));

        // 3. Simulate Controller Search
        const query = "Bryan";
        console.log(`\n--- Simulating Full Controller Search for "${query}" ---`);

        const textSearchQuery = { $text: { $search: query } };
        const regexQuery = { $regex: query, $options: 'i' };

    }).select('artistName status');
    console.log('Found Artists:', artists);

    console.log('Searching Songs...');
    const songs = await Song.find({
        $or: [
            { ...textSearchQuery, status: 'public' },
            { title: regexQuery, status: 'public' }
        ]
    }).select('title status');
    console.log('Found Songs:', songs);

    console.log('Searching Playlists...');
    try {
        const playlists = await Playlist.find({
            $or: [
                { ...textSearchQuery, isPublic: true },
                { title: regexQuery, isPublic: true }
            ]
        }).select('title isPublic');
        console.log('Found Playlists:', playlists);
    } catch (err: any) {
        console.error('Playlist Search Error:', err.message);
    }

} catch (error) {
    console.error('Test Failed:', error);
} finally {
    await mongoose.disconnect();
    console.log('\nDone.');
}
};

runTest();
