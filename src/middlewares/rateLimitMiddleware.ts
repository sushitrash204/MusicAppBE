import rateLimit from 'express-rate-limit';



export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'RATE_LIMIT_GLOBAL'
    }
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'RATE_LIMIT_AUTH'
    }
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip + "_" + (req.body.username || '');
    },
    message: {
        success: false,
        message: 'RATE_LIMIT_LOGIN'
    }
});
