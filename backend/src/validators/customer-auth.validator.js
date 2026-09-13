import { z } from 'zod';

const emailSchema = z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address');

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
