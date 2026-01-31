
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URI is not defined in .env");
    process.exit(1);
}


async function checkAndGrantPremium() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI as string);
        console.log('Connected.');

        const User = require('../src/models/User').default;
        const username = 'lgcute2';

        console.log(`Checking status for user: ${username}...`);
        const user = await User.findOne({ username });

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        console.log(`Current Status: IsPremium = ${user.isPremium}`);

        if (user.isPremium) {
            console.log(`✅ User '${username}' is ALREADY Premium.`);
            console.log(`Expiry Date: ${user.premiumExpiryDate}`);
        } else {
            console.log(`User is NOT Premium. Granting Premium now...`);

            user.isPremium = true;
            user.premiumExpiryDate = new Date('2027-01-31');
            await user.save();

            console.log('✅ Success! User granted premium access.');
            console.log(`New Expiry Date: ${user.premiumExpiryDate}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

checkAndGrantPremium();
