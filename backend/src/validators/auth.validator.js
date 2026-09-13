import { z } from 'zod';

const emailSchema = z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address');

export const loginAdminSchema = z
    .object({
        email: emailSchema,
        password: z
            .string({ required_error: 'Password is required' })
            .min(1, 'Password cannot be empty'),
    })
    .strip();