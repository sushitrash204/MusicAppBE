import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFavorite extends Document {
    user: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
    albums: mongoose.Types.ObjectId[];
    playlists: mongoose.Types.ObjectId[];
    artists: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const favoriteSchema = new mongoose.Schema<IFavorite>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }],
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist'
    }],
    artists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }]
}, {
    timestamps: true
});

const Favorite: Model<IFavorite> = mongoose.model<IFavorite>('Favorite', favoriteSchema);
export default Favorite;
