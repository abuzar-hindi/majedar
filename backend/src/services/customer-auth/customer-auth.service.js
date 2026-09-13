import bcrypt from 'bcryptjs';
import { Customer } from '../../models/Customer.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';

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

    return { customer: newCustomer.toJSON() };
};

export const loginCustomer = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const customer = await Customer.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!customer) {
        // Generic error message prevents user enumeration
        throw new UnauthorizedError('Invalid email or password');
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
