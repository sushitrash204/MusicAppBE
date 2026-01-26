import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';

interface IDecodedToken extends JwtPayload {
    id: string;
}

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as IDecodedToken;

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            // In express 5 (or using express-async-handler), throwing error works, but standard express 4 requires next(error)
            // The existing code threw error, implying standard Error handling middleware will catch it if async handler is used or if express 5.
            // But since 'throw new Error' inside async without try/catch around the whole block (or async middleware wrapper) might crash app in Express 4.
            // However, the previous code had try/catch for verification.
            // If verification fails, it goes to catch block.
            // Inside catch block, throwing Error might be unhandled promise rejection if not passed to next.
            // I will use next(new Error(...)) for better safety or just keep throw if user relies on express-async-errors (not installed).
            // I'll stick to next(error) pattern mostly, but to match logic:
            next(new Error('Not authorized, token failed'));
        }
    } else if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

export { protect };
