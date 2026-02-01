
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

async function checkSpecificUser() {
    const targetId = '697e3bf8501458330701f534';
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        const user = await User.findById(targetId);
        if (user) {
            console.log('--- User Found ---');
            console.log('Username:', user.username);
            console.log('Is Premium:', user.isPremium);
            console.log('Expiry:', user.premiumExpiryDate);
        } else {
            console.log('--- User NOT Found ---');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}
checkSpecificUser();
