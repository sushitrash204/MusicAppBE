
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from Backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI;
console.log('MongoDB URI Length:', MONGO_URI ? MONGO_URI.length : 0);

async function runDebug() {
    try {
        if (!MONGO_URI) throw new Error('Missing MONGODB_URI in .env');

        console.log('Connecting to mongoose...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');


        const collections = ['songs', 'artists', 'albums', 'playlists'];

        for (const colName of collections) {
            console.log(`\n=== Collection: ${colName} ===`);
            const col = mongoose.connection.collection(colName);

            // 1. Force Create Text Index
            try {
                let indexFields = {};
                if (colName === 'songs') indexFields = { title: 'text', lyrics: 'text' };
                if (colName === 'artists') indexFields = { artistName: 'text', bio: 'text' };
                if (colName === 'albums') indexFields = { title: 'text', description: 'text' };
                if (colName === 'playlists') indexFields = { title: 'text', description: 'text' };

                console.log(`Creating/Ensuring Text Index for ${colName}...`);
                await col.createIndex(indexFields, { name: 'TextIndex_ForceBuild' });
                console.log('✅ Index Created/Ensured.');
            } catch (e) {
                console.log('Index Creation Error (might already exist):', e.message);
            }

            // 2. Check Indexes
            try {
                const indexes = await col.indexes();
                const textIndex = indexes.find(i => i.key._fts === 'text');
                if (textIndex) console.log('✅ Text Index Verified Present:', textIndex.name);
                else console.log('❌ Text Index STILL MISSING!');
            } catch (err) {
                console.log('Error checking indexes:', err.message);
            }
        }

        console.log('\n--- Running Regex Search (Simulate Controller) ---');
        const query = "Bryan";
        const regex = new RegExp(query, 'i');
        const db = mongoose.connection.db;

        const artists = await db.collection('artists').find({
            $or: [
                { artistName: regex }
            ]
        }).toArray();

        console.log(`Artists found matching "${query}" (Regex):`);
        artists.forEach(a => console.log(`- [${a.status}] ${a.artistName} (ID: ${a._id})`));


    } catch (err) {
        console.error('FATAL ERROR:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDebug Finished.');
    }
}

runDebug();
