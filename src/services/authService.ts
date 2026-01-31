import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken';
import Artist from '../models/Artist';
import { v4 as uuidv4 } from 'uuid';

interface IAuthResponse {
    _id: any;
    fullName: string;
    username: string;
    email: string[];
    phone: string;
    role: string;
    isArtist: boolean;
    isPremium?: boolean;
    accessToken: string;
    refreshToken: string;
}

const generateTokens = async (userId: any): Promise<{ accessToken: string, refreshToken: string }> => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: '15m',
    });

    const refreshToken = uuidv4();

    // Lưu vào DB
    let expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Hết hạn sau 7 ngày

    await RefreshToken.create({
        token: refreshToken,
        user: userId,
        expiryDate: expiryDate,
    });

    return { accessToken, refreshToken };
};

const registerUser = async (userData: any): Promise<IAuthResponse> => {
    const { fullName, username, password, phoneNumber, email } = userData;

    const userExists = await User.findOne({ username });
    if (userExists) {
        throw new Error('ERR_USER_EXISTS');
    }

    const user = await User.create({
        fullName,
        username,
        password,
        phoneNumber,
        emails: email ? [email] : []
    });

    if (user) {
        const { accessToken, refreshToken } = await generateTokens(user._id);
        const artistDoc = await Artist.exists({ userId: user._id, status: 'active' });

        return {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.emails,
            phone: user.phoneNumber,
            role: user.role,
            isArtist: !!artistDoc,
            isPremium: user.isPremium,
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('VAL_INVALID_DATA');
    }
};

const checkPremiumStatus = async (user: IUser) => {
    if (user.isPremium && user.premiumExpiryDate) {
        if (new Date() > new Date(user.premiumExpiryDate)) {
            console.log(`Premium for user ${user.username} expired on ${user.premiumExpiryDate}. Downgrading.`);
            user.isPremium = false;
            user.premiumExpiryDate = undefined; // Use undefined or null based on schema, null matches schema better usually but optional field? Schema says Date.
            // Schema has premiumExpiryDate: { type: Date }.
            // Mongoose allows setting to null or undefined to unset.
            // Let's cast to any if needed to set null, or just modify schema definition if needed.
            // But for now, let's keep it simple.
            (user as any).premiumExpiryDate = null;
            await user.save();
        }
    }
};

const loginUser = async (username: string, password: string): Promise<IAuthResponse> => {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        // Check Premium Validity
        await checkPremiumStatus(user);

        const { accessToken, refreshToken } = await generateTokens(user._id);
        const artistDoc = await Artist.exists({ userId: user._id, status: 'active' });

        return {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.emails,
            phone: user.phoneNumber,
            role: user.role,
            isArtist: !!artistDoc,
            isPremium: user.isPremium,
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('ERR_WRONG_PASSWORD');
    }
};

const verifyExpiration = (token: any): boolean => {
    return token.expiryDate.getTime() < new Date().getTime();
}

const refreshToken = async (requestToken: string): Promise<{ accessToken: string, refreshToken: string }> => {
    if (!requestToken) {
        throw new Error('ERR_NO_TOKEN');
    }

    const refreshTokenDoc = await RefreshToken.findOne({ token: requestToken });

    if (!refreshTokenDoc) {
        throw new Error('ERR_INVALID_TOKEN');
    }

    if (verifyExpiration(refreshTokenDoc)) {
        await RefreshToken.findByIdAndDelete(refreshTokenDoc._id);
        throw new Error('ERR_TOKEN_EXPIRED');
    }

    const user = await User.findById(refreshTokenDoc.user);
    if (!user) throw new Error('ERR_USER_NOT_FOUND');

    await checkPremiumStatus(user);

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '15m',
    });
    const artistDoc = await Artist.exists({ userId: user._id, status: 'active' });

    return {
        accessToken: newAccessToken,
        refreshToken: refreshTokenDoc.token,
        isArtist: !!artistDoc
    } as any; // Cast to any or verify return type match
};

export default {
    registerUser,
    loginUser,
    refreshToken
};
