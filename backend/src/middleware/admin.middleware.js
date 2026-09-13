import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/**
 * Authorize specified roles for an authenticated admin.
 * @param  {...string} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => {
    const roles = allowedRoles.length > 0 ? allowedRoles : ['admin', 'super-admin'];

    return (req, res, next) => {
        if (!req.admin) {
            return next(new UnauthorizedError('Authentication required before authorization'));
        }

        if (!roles.includes(req.admin.role)) {
            return next(new ForbiddenError('You do not have permission to perform this action'));
        }

        next();
    };
};

/**
 * Require at least the 'admin' or 'super-admin' role.
 */
export const requireAdmin = authorizeRoles('admin', 'super-admin');

// Backward-compatibility alias
export const isAdmin = requireAdmin;
