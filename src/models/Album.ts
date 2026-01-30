import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAlbum extends Document {
    title: string;
    artist: mongoose.Types.ObjectId;
    description?: string;
    coverImage?: string;
    songs: mongoose.Types.ObjectId[];
    releaseDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const albumSchema = new mongoose.Schema<IAlbum>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
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
    releaseDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
albumSchema.index({ artist: 1 }); // Optimize query by artist
albumSchema.index({ releaseDate: -1 });

const Album: Model<IAlbum> = mongoose.model<IAlbum>('Album', albumSchema);
export default Album;
