import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

import { deleteCloudinaryFile } from '../config/cloudinary';

// @desc    Update user profile (Name, Phone, Avatar, Password)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update basic info
        user.fullName = req.body.fullName || user.fullName;
        user.phoneNumber = req.body.phone || user.phoneNumber;

        // Update email if provided
        if (req.body.email) {
            user.emails = [req.body.email];
        }

        // Update avatar if file is uploaded
        if (req.file) {
            // Delete old avatar if it exists
            if (user.avatar) {
                await deleteCloudinaryFile(user.avatar);
            }
            user.avatar = req.file.path;
        }

        // Update password if provided
        if (req.body.newPassword) {
            if (!req.body.currentPassword) {
                // If uploading file successfully but password fails, we should delete the newly uploaded file to avoid orphans
                if (req.file) {
                    await deleteCloudinaryFile(req.file.path);
                }
                return res.status(400).json({ message: 'Please provide current password to change password' });
            }

            // Check current password
            const isMatch = await user.matchPassword(req.body.currentPassword);
            if (!isMatch) {
                if (req.file) {
                    await deleteCloudinaryFile(req.file.path);
                }
                return res.status(400).json({ message: 'Invalid current password' });
            }

            user.password = req.body.newPassword;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.emails && updatedUser.emails.length > 0 ? updatedUser.emails[0] : '',
            fullName: updatedUser.fullName,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            phone: updatedUser.phoneNumber,
            isPremium: updatedUser.isPremium,
            token: req.headers.authorization?.split(' ')[1] // Keep existing token
        });

    } catch (error: any) {
        // If error occurs and we uploaded a file, clean it up
        if (req.file) {
            await deleteCloudinaryFile(req.file.path);
        }
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.emails && user.emails.length > 0 ? user.emails[0] : '',
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            phone: user.phoneNumber,
            isPremium: user.isPremium,
            // token is not needed for get profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { updateUserProfile, getUserProfile };
