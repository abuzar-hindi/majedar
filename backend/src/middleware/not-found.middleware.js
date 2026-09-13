import { NotFoundError } from '../utils/errors.js';

/**
 * Handle requests to undefined routes and forward to error middleware.
 */
export const notFoundHandler = (req, res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};
