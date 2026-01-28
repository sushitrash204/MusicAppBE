import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@spotify.com';
        const adminUsername = 'admin';
        const adminPassword = 'adminpassword';

        const userExists = await User.findOne({ emails: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const adminUser = await User.create({
            username: adminUsername,
            emails: [adminEmail],
            password: adminPassword,
            fullName: 'System Admin',
            role: 'admin'
        });

        if (adminUser) {
            console.log('Admin user created successfully');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        } else {
            console.log('Invalid user data');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
