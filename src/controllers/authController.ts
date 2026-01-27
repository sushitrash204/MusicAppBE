import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import RefreshToken from '../models/RefreshToken';

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

        res.status(201).json({
            message: 'AUTH_REGISTER_SUCCESS',
            ...user
        });
    } catch (error: any) {
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

        res.status(200).json({
            message: 'AUTH_LOGIN_SUCCESS',
            ...user
        });
    } catch (error: any) {
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

        res.status(200).json({
            message: 'AUTH_REFRESH_SUCCESS',
            accessToken
        });
    } catch (error: any) {
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
        console.log('Logout initiated');
        const refreshToken = req.cookies.refreshToken;
        console.log('Refresh Token from Cookie:', refreshToken);

        if (refreshToken) {
            const deleted = await RefreshToken.findOneAndDelete({ token: refreshToken });
            console.log('Token deleted from DB:', deleted ? 'Yes' : 'No (Not Found)');
        } else {
            console.log('No refresh token in cookie');
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        console.log('Cookie cleared response sent');
        res.status(200).json({
            message: 'AUTH_LOGOUT_SUCCESS'
        });
    } catch (error) {
        console.error('Logout Error:', error);
        next(error);
    }
};

export default {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
};
