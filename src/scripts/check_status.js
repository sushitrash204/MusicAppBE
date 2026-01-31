
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGO_URI = process.env.MONGODB_URI;

async function checkStatus() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB.');

        const collections = ['songs', 'artists', 'albums', 'playlists'];
        let missingIndexes = [];

        for (const colName of collections) {
            const col = mongoose.connection.collection(colName);
            const indexes = await col.indexes();
            const textIndex = indexes.find(i => i.key._fts === 'text');
            if (!textIndex) {
                console.log(`❌ MISSING Index on: ${colName}`);
                missingIndexes.push(colName);
            } else {
                console.log(`✅ Index OK: ${colName}`);
            }
        }

        if (missingIndexes.length > 0) {
            console.log('--- TEST RESULT: BROKEN 🚨 ---');
            console.log('Reason: Missing Database Indexes.');
        } else {
            console.log('--- TEST RESULT: OK ✅ ---');
            console.log('Indexes are present. Search should work.');

            // Run a quick test search
            const count = await mongoose.connection.db.collection('songs').countDocuments({ $text: { $search: "Love" } });
            console.log(`Test Search 'Love' found ${count} songs.`);
        }

    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkStatus();
