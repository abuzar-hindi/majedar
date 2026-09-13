import { verifyToken } from '../utils/token.js';
import { Customer } from '../models/Customer.js';
import { UnauthorizedError } from '../utils/errors.js';
import { config } from '../config/env.js';

/**
 * Middleware to authenticate customer requests via HttpOnly cookie.
 */
export const authenticateCustomer = async (req, res, next) => {
    try {
        const token = req.cookies?.[config.customerCookie.name];
        if (!token) {
            throw new UnauthorizedError('Authentication required. Please log in.');
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

        // Ensure token is specifically issued for a customer
        if (!decoded || !decoded.id || decoded.type !== 'customer') {
            throw new UnauthorizedError('Invalid customer token.');
        }

        // Verify that customer still exists in database
        const customer = await Customer.findById(decoded.id);
        if (!customer) {
            throw new UnauthorizedError('Customer account not found or deactivated.');
        }

        req.customer = customer;
        next();
    } catch (error) {
        next(error);
    }
};
