import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPlaylist extends Document {
    title: string;
    owner: mongoose.Types.ObjectId;
    description?: string;
    coverImage?: string;
    songs: mongoose.Types.ObjectId[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const playlistSchema = new mongoose.Schema<IPlaylist>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
playlistSchema.index({ title: 'text', description: 'text' });

const Playlist: Model<IPlaylist> = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;
