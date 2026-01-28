import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IArtist extends Document {
    userId: mongoose.Types.ObjectId;
    artistName: string;
    bio: string;
    totalStreams: number;
    followers: number;
    status: 'pending' | 'active' | 'rejected' | 'banned';
    createdAt: Date;
}

const artistSchema = new mongoose.Schema<IArtist>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One artist profile per user
    },
    artistName: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    totalStreams: {
        type: Number,
        default: 0
    },
    followers: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected', 'banned'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Artist: Model<IArtist> = mongoose.model<IArtist>('Artist', artistSchema);
export default Artist;
