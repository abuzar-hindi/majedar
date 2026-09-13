import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/errors.js';

/**
 * Rate limiter for sensitive authentication endpoints (login, signup)
 * 10 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
    handler: (req, res, next, options) => {
        next(new TooManyRequestsError(options.message.message));
    },
});

export const customerAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
    handler: (req, res, next, options) => {
        next(new TooManyRequestsError(options.message.message));
    },
});

