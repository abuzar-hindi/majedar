import bcrypt from 'bcryptjs';
import { Customer } from '../../models/Customer.js';
import {
    ConflictError,
    UnauthorizedError,
    NotFoundError,
} from '../../utils/errors.js';
import { config } from '../../config/env.js';
import {
    createAndSendCustomerOtp,
    verifyCustomerOtp,
} from './customer-otp.service.js';

const BCRYPT_SALT_ROUNDS = 12;

export const signupCustomer = async ({ name, email, phone, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check for pre-existing account
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
        throw new ConflictError('An account with this email already exists');
    }

    // Hash password with strong cost factor
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newCustomer = new Customer({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        emailVerified: false,
        tokenVersion: 0,
    });

    try {
        await newCustomer.save();
    } catch (error) {
        // Handle race-condition duplicate index error
        if (error.code === 11000) {
            throw new ConflictError('An account with this email already exists');
        }
        throw error;
    }

    // Generate and dispatch verification OTP
    try {
        await createAndSendCustomerOtp({
            email: normalizedEmail,
            type: 'email_verification',
            customerId: newCustomer._id,
            name: newCustomer.name,
        });
    } catch (otpError) {
        if (config.isProduction) {
            await Customer.deleteOne({ _id: newCustomer._id });
            await CustomerOtp.deleteMany({ email: normalizedEmail, type: 'email_verification' });
        }
        throw otpError;
    }

    return {
        customer: newCustomer.toJSON(),
        requiresVerification: true,
    };
};

export const verifyCustomerEmail = async ({ email, otp }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Validate OTP against stored hash, expiry, attempts, and single-use
    await verifyCustomerOtp({
        email: normalizedEmail,
        otp,
        type: 'email_verification',
    });

    const customer = await Customer.findOne({ email: normalizedEmail });
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    customer.emailVerified = true;
    await customer.save();

    return { customer: customer.toJSON() };
};

export const resendCustomerOtp = async ({ email, type = 'email_verification' }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // Anti-enumeration protection: return generic message if user doesn't exist
    if (!customer) {
        return {
            success: true,
            message: 'If the account exists and requires verification, a new code has been sent.',
        };
    }

    // If email is already verified and type is email_verification, return generic message
    if (type === 'email_verification' && customer.emailVerified) {
        return {
            success: true,
            message: 'If the account exists and requires verification, a new code has been sent.',
        };
    }

    await createAndSendCustomerOtp({
        email: normalizedEmail,
        type,
        customerId: customer._id,
        name: customer.name,
    });

    return {
        success: true,
        message: 'If the account exists and requires verification, a new code has been sent.',
    };
};

export const forgotCustomerPassword = async ({ email }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // Anti-enumeration protection: return generic success regardless of account existence
    if (!customer) {
        return {
            success: true,
            message: 'If an account with that email exists, a password reset code has been sent.',
        };
    }

    await createAndSendCustomerOtp({
        email: normalizedEmail,
        type: 'password_reset',
        customerId: customer._id,
        name: customer.name,
    });

    return {
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent.',
    };
};

export const resetCustomerPassword = async ({ email, otp, newPassword }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP first
    await verifyCustomerOtp({
        email: normalizedEmail,
        otp,
        type: 'password_reset',
    });

    const customer = await Customer.findOne({ email: normalizedEmail });
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    customer.passwordHash = passwordHash;

    // Invalidate existing sessions/tokens by incrementing tokenVersion
    customer.tokenVersion = (customer.tokenVersion || 0) + 1;

    await customer.save();

    return {
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
    };
};

export const loginCustomer = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const customer = await Customer.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!customer) {
        // Generic error message prevents user enumeration
        throw new UnauthorizedError('Invalid email or password');
    }

    // Prevent login if email has not been verified
    if (customer.emailVerified === false) {
        throw new UnauthorizedError('Please verify your email address before logging in.');
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password');
    }

    return { customer: customer.toJSON() };
};

export const getCustomerProfile = async (customerId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }
    return { customer: customer.toJSON() };
};

/**
 * Update authenticated customer profile details (name, phone).
 */
export const updateCustomerProfile = async (customerId, updates = {}) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    if (updates.name !== undefined) {
        customer.name = updates.name.trim();
    }
    if (updates.phone !== undefined) {
        customer.phone = updates.phone.trim();
    }

    await customer.save();
    return { customer: typeof customer.toJSON === 'function' ? customer.toJSON() : customer };
};

const getAddressById = (customer, addressId) => {
    if (typeof customer.addresses.id === 'function') {
        return customer.addresses.id(addressId);
    }
    return customer.addresses.find((a) => a._id?.toString() === addressId?.toString()) || null;
};

/**
 * Get all addresses for authenticated customer.
 */
export const getCustomerAddresses = async (customerId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }
    return customer.addresses;
};

/**
 * Add an address to the customer's address book.
 */
export const addCustomerAddress = async (customerId, addressData) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    // If marked as default or if this is their first address, unset others
    if (addressData.isDefault || customer.addresses.length === 0) {
        addressData.isDefault = true;
        customer.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
    }

    customer.addresses.push(addressData);
    await customer.save();
    return customer.addresses;
};

/**
 * Update an existing address in the customer's address book.
 */
export const updateCustomerAddress = async (customerId, addressId, addressData) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    const addr = getAddressById(customer, addressId);
    if (!addr) {
        throw new NotFoundError('Address not found');
    }

    if (addressData.isDefault) {
        customer.addresses.forEach((a) => {
            a.isDefault = false;
        });
    }

    Object.assign(addr, addressData);
    await customer.save();
    return customer.addresses;
};

/**
 * Delete an address from the customer's address book.
 */
export const deleteCustomerAddress = async (customerId, addressId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    const addr = getAddressById(customer, addressId);
    if (!addr) {
        throw new NotFoundError('Address not found');
    }

    const wasDefault = addr.isDefault;
    if (typeof addr.deleteOne === 'function') {
        addr.deleteOne();
    } else {
        customer.addresses = customer.addresses.filter(
            (a) => a._id.toString() !== addressId.toString()
        );
    }

    if (wasDefault && customer.addresses.length > 0) {
        customer.addresses[0].isDefault = true;
    }

    await customer.save();
    return customer.addresses;
};

/**
 * Set an address as the default address for the customer.
 */
export const setDefaultCustomerAddress = async (customerId, addressId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new NotFoundError('Customer account not found');
    }

    const targetAddr = getAddressById(customer, addressId);
    if (!targetAddr) {
        throw new NotFoundError('Address not found');
    }

    customer.addresses.forEach((a) => {
        a.isDefault = a._id.toString() === addressId.toString();
    });

    await customer.save();
    return customer.addresses;
};

