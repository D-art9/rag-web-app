import rateLimit from 'express-rate-limit';

// Global Limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict Limiter for AI endpoints: 20 requests per 15 minutes
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many AI requests, please ease up to conserve resources.' },
    standardHeaders: true,
    legacyHeaders: false,
});
