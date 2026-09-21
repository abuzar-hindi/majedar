import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/errors.js';

/**
 * Rate limiter for sensitive admin authentication endpoints (login, seed)
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

/**
 * Rate limiter for customer login and signup endpoints.
 * 20 requests per 15-minute window per IP.
 */
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

/**
 * Rate limiter for OTP generation and resend endpoints (e.g. forgot password, resend code)
 * Prevents spamming emails and overloading notification services.
 * 5 requests per 15-minute window per IP.
 */
export const customerOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 15 minutes.',
    },
    handler: (req, res, next, options) => {
        next(new TooManyRequestsError(options.message.message));
    },
});

/**
 * Rate limiter for OTP verification endpoints.
 * Prevents automated brute-force attempts on 6-digit codes.
 * 15 requests per 15-minute window per IP.
 */
export const customerOtpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many verification attempts. Please try again after 15 minutes.',
    },
    handler: (req, res, next, options) => {
        next(new TooManyRequestsError(options.message.message));
    },
});

/**
 * Rate limiter for contact and customer message submissions.
 * Prevents spamming and submission flooding.
 * 10 submissions per 15-minute window per IP.
 */
export const contactMessageLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many messages submitted. Please try again after 15 minutes.',
    },
    handler: (req, res, next, options) => {
        next(new TooManyRequestsError(options.message.message));
    },
});

/**
 * Rate limiter for payment initiation, verification, and retry endpoints.
 * Prevents brute-force payment manipulation and replay attacks.
 * 10 requests per 15-minute window per IP.
 */
export const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many payment requests. Please wait before trying again.',
    },
    handler: (req, res, next, options) => {
        next(new TooManyRequestsError(options.message.message));
    },
});
