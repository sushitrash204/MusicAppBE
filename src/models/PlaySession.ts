import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaySession extends Document {
    userId: mongoose.Types.ObjectId;
    songId: mongoose.Types.ObjectId;
    startTime: Date;
    status: 'pending' | 'completed' | 'expired';
    createdAt: Date;
}

const PlaySessionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    startTime: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});

export default mongoose.model<IPlaySession>('PlaySession', PlaySessionSchema);
