import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import Artist from '../models/Artist';
import connectDB from '../config/database';

const cleanSeededArtists = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        console.log('Cleaning up seeded artists...');

        // Find users with username starting with 'artist_seed_'
        const seededUsers = await User.find({ username: { $regex: /^artist_seed_/ } });
        const userIds = seededUsers.map(user => user._id);

        if (userIds.length > 0) {
            // Delete Artists associated with these users
            const deletedArtists = await Artist.deleteMany({ userId: { $in: userIds } });
            console.log(`Deleted ${deletedArtists.deletedCount} artist profiles.`);

            // Delete the Users themselves
            const deletedUsers = await User.deleteMany({ _id: { $in: userIds } });
            console.log(`Deleted ${deletedUsers.deletedCount} user accounts.`);
        } else {
            console.log('No seeded artists found to delete.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up artists:', error);
        process.exit(1);
    }
};

cleanSeededArtists();
