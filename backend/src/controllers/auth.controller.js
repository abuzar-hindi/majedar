import { loginAdmin } from '../services/auth/auth.service.js';
import { signToken } from '../utils/token.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Authenticate administrator credentials and set session cookie.
 */
export const login = async (req, res, next) => {
    try {
        const { admin } = await loginAdmin(req.body);
        const token = signToken({ id: admin._id, role: admin.role });

        setAuthCookie(res, token);

        return sendSuccess(res, {
            statusCode: 200,
            message: 'Login successful',
            data: { admin },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Terminate administrator session by clearing auth cookie.
 */
export const logout = async (req, res, next) => {
    try {
        clearAuthCookie(res);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve the current authenticated administrator's profile.
 */
export const getMe = async (req, res, next) => {
    try {
        const adminData = req.admin.toJSON ? req.admin.toJSON() : req.admin;
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Admin profile retrieved successfully',
            data: { admin: adminData },
        });
    } catch (error) {
        next(error);
    }
};

// Backward-compatibility aliases
export const loginAdminController = login;
export const logoutAdminController = logout;