import { z } from 'zod';
import { objectIdRegex } from './category.validator.js';

export const reviewIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid review ID format'),
});

export const menuItemIdParamSchema = z.object({
    menuItemId: z.string().regex(objectIdRegex, 'Invalid menu item ID format'),
});

export const createReviewSchema = z
    .object({
        orderId: z
            .string({ required_error: 'Order ID is required' })
            .regex(objectIdRegex, 'Invalid order ID format'),
        menuItemId: z
            .string({ required_error: 'Menu item ID is required' })
            .regex(objectIdRegex, 'Invalid menu item ID format'),
        rating: z
            .union([
                z.number().int('Rating must be an integer').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
                z.string().transform((val) => parseInt(val, 10)).refine((val) => Number.isInteger(val) && val >= 1 && val <= 5, {
                    message: 'Rating must be an integer between 1 and 5',
                }),
            ]),
    })
    .strip();

export const reviewQuerySchema = z
    .object({
        page: z
            .union([z.number().int().min(1), z.string().transform((v) => parseInt(v, 10))])
            .optional()
            .default(1),
        limit: z
            .union([z.number().int().min(1).max(100), z.string().transform((v) => parseInt(v, 10))])
            .optional()
            .default(20),
        rating: z
            .union([z.number().int().min(1).max(5), z.string().transform((v) => parseInt(v, 10))])
            .optional(),
    })
    .strip();
