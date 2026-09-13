import { signupCustomer, loginCustomer } from '../services/customer-auth/customer-auth.service.js';
import { signToken } from '../utils/token.js';
import { setCustomerAuthCookie, clearCustomerAuthCookie } from '../utils/cookie.js';
import { sendSuccess } from '../utils/response.js';

const CUSTOMER_TOKEN_EXPIRY = '7d';

/**
 * Register new customer and establish authenticated session.
 */
export const signup = async (req, res, next) => {
    try {
        const { customer } = await signupCustomer(req.body);
        const token = signToken({ id: customer._id, type: 'customer' }, CUSTOMER_TOKEN_EXPIRY);

        setCustomerAuthCookie(res, token);

        return sendSuccess(res, {
            statusCode: 201,
            message: 'Account created successfully',
            data: { customer },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Authenticate customer credentials and establish session cookie.
 */
export const login = async (req, res, next) => {
    try {
        const { customer } = await loginCustomer(req.body);
        const token = signToken({ id: customer._id, type: 'customer' }, CUSTOMER_TOKEN_EXPIRY);

        setCustomerAuthCookie(res, token);

        return sendSuccess(res, {
            statusCode: 200,
            message: 'Login successful',
            data: { customer },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Terminate customer session by clearing the auth cookie.
 */
export const logout = async (req, res, next) => {
    try {
        clearCustomerAuthCookie(res);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve authenticated customer profile.
 */
export const getMe = async (req, res, next) => {
    try {
        const customerData = req.customer.toJSON ? req.customer.toJSON() : req.customer;
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Customer profile retrieved successfully',
            data: { customer: customerData },
        });
    } catch (error) {
        next(error);
    }
};
