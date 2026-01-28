import rateLimit from 'express-rate-limit';



export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'RATE_LIMIT_GLOBAL'
    },
    validate: {
        trustProxy: false
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
    },
    validate: {
        trustProxy: false
    }
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'RATE_LIMIT_LOGIN'
    },
    validate: {
        trustProxy: false
    }
});
