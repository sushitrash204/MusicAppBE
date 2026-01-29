import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISong extends Document {
    title: string;
    artists: mongoose.Types.ObjectId[]; // Primary artist + featuring
    lyrics?: string;
    audioUrl: string; // Cloudinary/storage URL
    coverImage?: string;
    duration: number; // in seconds
    previewStart: number; // Start time for preview in seconds
    genres: mongoose.Types.ObjectId[];
    releaseDate: Date;
    plays: number;
    favoritesCount: number;
    status: 'draft' | 'public' | 'archived' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const songSchema = new mongoose.Schema<ISong>({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    artists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    }],
    lyrics: {
        type: String,
        default: ''
    },
    audioUrl: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: '' // Could default to Artist avatar if empty, but better to have song/album art
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    previewStart: {
        type: Number,
        default: 15, // Default to starting at 30s if not specified
        min: 0
    },
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    releaseDate: {
        type: Date,
        default: Date.now
    },
    plays: {
        type: Number,
        default: 0
    },
    favoritesCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'public', 'archived', 'rejected'],
        default: 'public'
    }
}, {
    timestamps: true
});

// Indexes for searching/sorting
songSchema.index({ title: 'text', lyrics: 'text' });
songSchema.index({ plays: -1 });
songSchema.index({ releaseDate: -1 });

const Song: Model<ISong> = mongoose.model<ISong>('Song', songSchema);
export default Song;
