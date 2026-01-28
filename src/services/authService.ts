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
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('VAL_INVALID_DATA');
    }
};

const loginUser = async (username: string, password: string): Promise<IAuthResponse> => {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
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
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('ERR_WRONG_PASSWORD'); // Or ERR_USER_NOT_FOUND, but security-wise generic is better? 
        // For now let's stick to what we had: 'Invalid username or password' -> ERR_WRONG_PASSWORD (or maybe new key ERR_LOGIN_FAIL)
        // Check types: ERR_WRONG_PASSWORD exists.
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
