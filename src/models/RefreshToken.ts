import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
    token: string;
    user: mongoose.Types.ObjectId;
    expiryDate: Date;
    createdAt: Date;
}

interface IRefreshTokenModel extends Model<IRefreshToken> {
    verifyExpiration(token: IRefreshToken): boolean;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d'
    }
});

refreshTokenSchema.statics.verifyExpiration = (token: IRefreshToken): boolean => {
    return token.expiryDate.getTime() < new Date().getTime();
}

const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>('RefreshToken', refreshTokenSchema);
export default RefreshToken;
