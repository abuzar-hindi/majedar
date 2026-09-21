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

        // Session invalidation: check token version against customer's current version
        if (
            decoded.tokenVersion !== undefined &&
            customer.tokenVersion !== undefined &&
            decoded.tokenVersion !== customer.tokenVersion
        ) {
            throw new UnauthorizedError('Session expired or invalidated. Please log in again.');
        }

        // Enforce email verification
        if (customer.emailVerified === false) {
            throw new UnauthorizedError('Please verify your email address to access your account.');
        }

        req.customer = customer;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional customer authentication: attaches req.customer if valid token present, otherwise continues as guest.
 */
export const optionalCustomerAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.[config.customerCookie.name];
        if (token) {
            const decoded = verifyToken(token);
            if (decoded && decoded.id && decoded.type === 'customer') {
                const customer = await Customer.findById(decoded.id);
                if (customer && customer.emailVerified !== false) {
                    req.customer = customer;
                }
            }
        }
    } catch {
        // Silently ignore invalid token and proceed as guest
    }
    next();
};
