import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Upload audio file
export const uploadAudio = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        // File is already uploaded to Cloudinary via multer middleware
        // req.file.path contains the Cloudinary URL
        res.status(200).json({
            message: 'Audio uploaded successfully',
            url: req.file.path,
            duration: 0 // Client should calculate or send this
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Upload cover image
export const uploadCover = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No cover image uploaded' });
        }

        res.status(200).json({
            message: 'Cover image uploaded successfully',
            url: req.file.path
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
