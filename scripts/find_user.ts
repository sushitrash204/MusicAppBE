
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

async function findUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        const u = await User.findOne();
        if (u) {
            console.log('FOUND_USER_ID:' + u._id);
            console.log('USERNAME:' + u.username);
        } else {
            console.log('NO_USER_FOUND');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
findUser();
