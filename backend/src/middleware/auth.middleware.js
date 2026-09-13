import { verifyToken } from '../utils/token.js';
import { Admin } from '../models/Admin.js';
import { UnauthorizedError } from '../utils/errors.js';
import { config } from '../config/env.js';

/**
 * Authenticate incoming requests via HttpOnly cookie containing JWT.
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.[config.cookie.name];
        if (!token) {
            throw new UnauthorizedError('Authentication required. No session token provided.');
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                throw new UnauthorizedError('Session expired. Please log in again.');
            }
            throw new UnauthorizedError('Invalid authentication token.');
        }

        if (!decoded || !decoded.id) {
            throw new UnauthorizedError('Malformed authentication token.');
        }

        // Fetch current admin document from database
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            throw new UnauthorizedError('Admin account not found or deactivated.');
        }

        // Attach sanitized admin object to request
        req.admin = admin;
        next();
    } catch (error) {
        next(error);
    }
};

// Backward-compatibility alias
export const validateAdminToken = authenticateAdmin;