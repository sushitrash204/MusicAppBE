
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function repairIndexes() {
    try {
        if (!MONGO_URI) throw new Error('Missing MONGODB_URI');
        console.log('Connecting to DB to REPAIR indexes...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const collections = ['songs', 'artists', 'albums', 'playlists'];

        for (const colName of collections) {
            console.log(`\nProcessing Collection: ${colName}`);
            const col = mongoose.connection.collection(colName);

            try {
                // 1. Drop All Indexes (except _id)
                console.log('Dropping existing indexes...');
                await col.dropIndexes();
                console.log('Indexes dropped.');
            } catch (e) {
                console.log('Drop error (might be empty):', e.message);
            }

            // 2. Recreate Text Index
            console.log('Recreating Text Index...');
            let indexFields = {};
            if (colName === 'songs') indexFields = { title: 'text', lyrics: 'text' };
            if (colName === 'artists') indexFields = { artistName: 'text', bio: 'text' };
            if (colName === 'albums') indexFields = { title: 'text', description: 'text' };
            if (colName === 'playlists') indexFields = { title: 'text', description: 'text' };

            await col.createIndex(indexFields, { name: 'TextIndex' });
            console.log(`✅ Text Index created for ${colName}`);
        }

    } catch (err) {
        console.error('Repair Failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nRepair Finished. Please RESTART your Backend.');
    }
}

repairIndexes();
