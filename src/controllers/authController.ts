import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = req.body;
        const { refreshToken, ...user } = await authService.registerUser(userData);

        setRefreshTokenCookie(res, refreshToken);

        res.status(201).json(user);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        const { refreshToken, ...user } = await authService.loginUser(username, password);

        setRefreshTokenCookie(res, refreshToken);

        res.status(200).json(user);
    } catch (error) {
        res.status(401);
        next(error);
    }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestToken = req.cookies.refreshToken;
        const { accessToken } = await authService.refreshToken(requestToken);

        res.status(200).json({ accessToken });
    } catch (error) {
        res.clearCookie('refreshToken');
        res.status(403);
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // Xóa Refresh Token khỏi DB
            // Using require to avoid cyclic dependency if any, or just import model directly? 
            // In TS better to import model. Although Controller -> Model is fine.
            // But here I'll dynamically import or better just import RefreshToken at top.
            // But authService handles logic usually. Ideally logout logic should be in service.
            // For now I'll just use the model directly as before.
            const RefreshToken = (await import('../models/RefreshToken')).default;
            await RefreshToken.findOneAndDelete({ token: refreshToken });
        }

        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export default {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
};
