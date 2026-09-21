import { z } from 'zod';

const emailSchema = z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address');

const otpSchema = z
    .string({ required_error: 'Verification code is required' })
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be a 6-digit number');

export const customerSignupSchema = z
    .object({
        name: z
            .string({ required_error: 'Name is required' })
            .trim()
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name must not exceed 100 characters'),
        email: emailSchema,
        phone: z
            .string({ required_error: 'Phone number is required' })
            .trim()
            .min(7, 'Please enter a valid phone number')
            .max(20, 'Phone number must not exceed 20 characters'),
        password: z
            .string({ required_error: 'Password is required' })
            .min(6, 'Password must be at least 6 characters long')
            .max(128, 'Password must not exceed 128 characters'),
    })
    .strip();

export const customerLoginSchema = z
    .object({
        email: emailSchema,
        password: z
            .string({ required_error: 'Password is required' })
            .min(1, 'Password cannot be empty'),
    })
    .strip();

export const verifyEmailSchema = z
    .object({
        email: emailSchema,
        otp: otpSchema,
    })
    .strip();

export const resendOtpSchema = z
    .object({
        email: emailSchema,
        type: z
            .enum(['email_verification', 'password_reset'])
            .optional()
            .default('email_verification'),
    })
    .strip();

export const forgotPasswordSchema = z
    .object({
        email: emailSchema,
    })
    .strip();

export const resetPasswordSchema = z
    .object({
        email: emailSchema,
        otp: otpSchema,
        newPassword: z
            .string({ required_error: 'New password is required' })
            .min(6, 'Password must be at least 6 characters long')
            .max(128, 'Password must not exceed 128 characters'),
    })
    .strip();

export const updateCustomerProfileSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name must not exceed 100 characters')
            .optional(),
        phone: z
            .string()
            .trim()
            .min(7, 'Please enter a valid phone number')
            .max(20, 'Phone number must not exceed 20 characters')
            .optional(),
    })
    .strip();

export const customerAddressInputSchema = z
    .object({
        label: z.string().trim().max(50).optional().default('Home'),
        firstName: z.string({ required_error: 'First name is required' }).trim().min(1, 'First name is required'),
        lastName: z.string({ required_error: 'Last name is required' }).trim().min(1, 'Last name is required'),
        phone: z.string({ required_error: 'Phone number is required' }).trim().min(7, 'Phone number is required'),
        email: z.string().trim().email('Invalid email').optional().nullable(),
        address: z.string({ required_error: 'Street address is required' }).trim().min(3, 'Address is required'),
        area: z.string().trim().optional().nullable(),
        deliveryZoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid delivery zone ID').optional().nullable(),
        landmark: z.string().trim().optional().nullable(),
        deliveryInstructions: z.enum(['Call on arrival', 'Leave at the gate', "Don't ring the bell", 'Other']).optional().nullable(),
        deliveryInstructionOther: z.string().trim().optional().nullable(),
        isDefault: z.boolean().optional().default(false),
    })
    .strip();

export const addressIdParamSchema = z.object({
    addressId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid address ID format'),
});

