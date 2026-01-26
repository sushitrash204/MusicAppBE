import { Request, Response, NextFunction } from 'express';

const admin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
        // Note: Similar to authMiddleware, throw inside sync function is caught by Express, but inside async it needs next().
        // This function is sync, so throw is fine for Express 4.
    }
};

export { admin };
