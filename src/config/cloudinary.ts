import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const randomName = uuidv4();
        return {
            folder: 'music_app_uploads',
            resource_type: 'auto' as any,
            allowed_formats: ['jpg', 'png', 'mp3', 'wav', 'jpeg'],
            public_id: randomName,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        };
    }
});

const uploadCloud = multer({ storage });

export default uploadCloud;

export const deleteCloudinaryFile = async (fileUrl: string) => {
    if (!fileUrl) return;

    try {
        // Extract public_id from URL
        // Example: https://res.cloudinary.com/cloudname/video/upload/v1234/folder/filename.mp4
        const parts = fileUrl.split('/');
        const fileName = parts[parts.length - 1];
        const folderName = parts[parts.length - 2];

        // Remove extension
        const publicIdWithFolder = `${folderName}/${fileName.split('.')[0]}`;

        // Determine resource type (image or video/audio)
        const isImage = fileUrl.includes('/image/upload/');
        const resourceType = isImage ? 'image' : 'video'; // Audio is treated as video in Cloudinary API usually, or 'raw'

        await cloudinary.uploader.destroy(publicIdWithFolder, { resource_type: resourceType });
        console.log(`Deleted Cloudinary file: ${publicIdWithFolder}`);
    } catch (error) {
        console.error('Error deleting Cloudinary file:', error);
    }
};
