import { AppError } from '../utils/errors.js';
import { config } from '../config/env.js';

/**
 * Global centralized error-handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let errors = err.errors || null;

    // Handle Mongoose duplicate key race condition (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        message = `An account with this ${field} already exists`;
        errors = null;
    }

    // Handle Mongoose schema validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Database validation failed';
        errors = Object.values(err.errors || {}).map((val) => ({
            field: val.path,
            message: val.message,
        }));
    }

    // Handle Mongoose CastError (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errors = null;
    }

    // Handle JWT errors if unhandled by middleware
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
        errors = null;
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
        errors = null;
    }

    // Protect against leaking internal / unexpected 500 errors in production
    if (statusCode === 500) {
        console.error('[Unhandled Error]:', err);
        if (config.isProduction) {
            message = 'An unexpected internal error occurred';
            errors = null;
        }
    }


    const errorResponse = {
        success: false,
        message,
    };

    if (errors) {
        errorResponse.errors = errors;
    }

    // Never leak stack traces to clients
    return res.status(statusCode).json(errorResponse);
};
