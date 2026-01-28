import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGenre extends Document {
    name: string;
    description?: string;
    createdAt: Date;
}

const genreSchema = new mongoose.Schema<IGenre>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Genre: Model<IGenre> = mongoose.model<IGenre>('Genre', genreSchema);
export default Genre;
