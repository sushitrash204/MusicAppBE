import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const TEST_USERNAME = 'lgcute';
const API_URL = 'http://localhost:3000/api/payment/sepay-webhook';

// Copy from .env or use the one we saw
const SEPAY_API_KEY = process.env.SEPAY_API_KEY;

// Mock Schema to find user
const userSchema = new mongoose.Schema({
    username: String,
    isPremium: Boolean,
    premiumExpiryDate: Date,
});
const User = mongoose.model('User', userSchema, 'users'); // ensure collection name is users

async function runTest() {
    if (!SEPAY_API_KEY) {
        console.error('❌ SEPAY_API_KEY not found in .env');
        return;
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected.');

        console.log(`🔍 Searching for user: ${TEST_USERNAME}...`);
        const user = await User.findOne({ username: TEST_USERNAME });

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        console.log(`👤 Found User: ${user._id} (Current Premium Status: ${user.isPremium})`);

        const payload = {
            gateway: "TestBank",
            transactionDate: new Date().toISOString(),
            accountNumber: "123456789",
            subAccount: "SEPAY_ACC",
            transferAmount: 20000,
            transferContent: `MUSA ${user._id}`, // THE MAGIC STRING
            referenceCode: "TEST_REF_" + Date.now(),
            description: `MUSA ${user._id}`
        };

        console.log(`🚀 Sending Webhook Request to ${API_URL}...`);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Apikey ${SEPAY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('---------------------------------------------------');
        console.log('📨 Server Response:', response.data);
        console.log('---------------------------------------------------');

        if (response.data.success) {
            console.log('🎉 Payment processed successfully!');
            // Re-check user
            const updatedUser = await User.findOne({ username: TEST_USERNAME });
            console.log(`🌟 User ${TEST_USERNAME} Premium Status: ${updatedUser?.isPremium}`);
            console.log(`📅 Expires at: ${updatedUser?.premiumExpiryDate}`);
        } else {
            console.error('⚠️ Server returned success=false');
        }

    } catch (error: any) {
        console.error('❌ Error testing webhook:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
