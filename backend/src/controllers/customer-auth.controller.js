import * as customerAuthService from '../services/customer-auth/customer-auth.service.js';
import {
    signupCustomer,
    loginCustomer,
    verifyCustomerEmail,
    resendCustomerOtp,
    forgotCustomerPassword,
    resetCustomerPassword,
} from '../services/customer-auth/customer-auth.service.js';
import { signToken } from '../utils/token.js';
import { setCustomerAuthCookie, clearCustomerAuthCookie } from '../utils/cookie.js';
import { sendSuccess } from '../utils/response.js';

const CUSTOMER_TOKEN_EXPIRY = '7d';

/**
 * Register new customer and dispatch verification OTP.
 * Does NOT issue an authenticated session until email is verified.
 */
export const signup = async (req, res, next) => {
    try {
        const { customer, requiresVerification } = await signupCustomer(req.body);

        return sendSuccess(res, {
            statusCode: 201,
            message: 'Account created successfully. Please verify your email with the code sent.',
            data: { customer, requiresVerification },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify customer email address using 6-digit OTP and establish session cookie.
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { customer } = await verifyCustomerEmail(req.body);
        const token = signToken(
            { id: customer._id, type: 'customer', tokenVersion: customer.tokenVersion ?? 0 },
            CUSTOMER_TOKEN_EXPIRY
        );

        setCustomerAuthCookie(res, token);

        return sendSuccess(res, {
            statusCode: 200,
            message: 'Email verified successfully',
            data: { customer },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend email verification or password reset OTP.
 * Returns generic message to prevent account enumeration.
 */
export const resendOtp = async (req, res, next) => {
    try {
        const result = await resendCustomerOtp(req.body);

        return sendSuccess(res, {
            statusCode: 200,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Initiate password reset flow.
 * Returns generic message regardless of email existence to prevent user enumeration.
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const result = await forgotCustomerPassword(req.body);

        return sendSuccess(res, {
            statusCode: 200,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset customer password using verified OTP and invalidate existing sessions.
 */
export const resetPassword = async (req, res, next) => {
    try {
        const result = await resetCustomerPassword(req.body);

        // Clear existing session cookie on caller
        clearCustomerAuthCookie(res);

        return sendSuccess(res, {
            statusCode: 200,
            message: result.message,
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
        const token = signToken(
            { id: customer._id, type: 'customer', tokenVersion: customer.tokenVersion ?? 0 },
            CUSTOMER_TOKEN_EXPIRY
        );

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

/**
 * Update authenticated customer profile.
 */
export const updateProfile = async (req, res, next) => {
    try {
        const result = await customerAuthService.updateCustomerProfile(req.customer._id, req.body);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Profile updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all addresses for authenticated customer.
 */
export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await customerAuthService.getCustomerAddresses(req.customer._id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Addresses retrieved successfully',
            data: { addresses },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a new address to customer address book.
 */
export const addAddress = async (req, res, next) => {
    try {
        const addresses = await customerAuthService.addCustomerAddress(req.customer._id, req.body);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Address added successfully',
            data: { addresses },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing address.
 */
export const updateAddress = async (req, res, next) => {
    try {
        const addresses = await customerAuthService.updateCustomerAddress(
            req.customer._id,
            req.params.addressId,
            req.body
        );
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Address updated successfully',
            data: { addresses },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an address.
 */
export const deleteAddress = async (req, res, next) => {
    try {
        const addresses = await customerAuthService.deleteCustomerAddress(
            req.customer._id,
            req.params.addressId
        );
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Address deleted successfully',
            data: { addresses },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Set default address.
 */
export const setDefaultAddress = async (req, res, next) => {
    try {
        const addresses = await customerAuthService.setDefaultCustomerAddress(
            req.customer._id,
            req.params.addressId
        );
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Default address updated successfully',
            data: { addresses },
        });
    } catch (error) {
        next(error);
    }
};

