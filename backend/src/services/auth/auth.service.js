import { Admin } from '../../models/Admin.js';
import { UnauthorizedError, NotFoundError } from '../../utils/errors.js';

export const loginAdmin = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Query admin including hidden passwordHash
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!admin) {
        // Generic error message to prevent user enumeration
        throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        // Generic error message
        throw new UnauthorizedError('Invalid email or password');
    }

    return { admin: admin.toJSON() };
};

export const getAdminProfile = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new NotFoundError('Admin account not found');
    }
    return { admin: admin.toJSON() };
};
