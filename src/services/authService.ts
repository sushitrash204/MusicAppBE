import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken';
import { v4 as uuidv4 } from 'uuid';

interface IAuthResponse {
    _id: any;
    fullName: string;
    username: string;
    email: string[];
    isAdmin: boolean;
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
        throw new Error('User already exists');
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

        return {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.emails,
            isAdmin: user.role === 'admin',
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const loginUser = async (username: string, password: string): Promise<IAuthResponse> => {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        const { accessToken, refreshToken } = await generateTokens(user._id);

        return {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.emails,
            isAdmin: user.role === 'admin',
            accessToken,
            refreshToken
        };
    } else {
        throw new Error('Invalid username or password');
    }
};

const verifyExpiration = (token: any): boolean => {
    return token.expiryDate.getTime() < new Date().getTime();
}

const refreshToken = async (requestToken: string): Promise<{ accessToken: string, refreshToken: string }> => {
    if (!requestToken) {
        throw new Error('Refresh Token is required!');
    }

    const refreshTokenDoc = await RefreshToken.findOne({ token: requestToken });

    if (!refreshTokenDoc) {
        throw new Error('Refresh token is not in database!');
    }

    if (verifyExpiration(refreshTokenDoc)) {
        await RefreshToken.findByIdAndDelete(refreshTokenDoc._id);
        throw new Error('Refresh token was expired. Please make a new signin request');
    }

    const user = await User.findById(refreshTokenDoc.user);
    if (!user) throw new Error('User not found');

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '15m',
    });

    return {
        accessToken: newAccessToken,
        refreshToken: refreshTokenDoc.token,
    };
};

export default {
    registerUser,
    loginUser,
    refreshToken
};
