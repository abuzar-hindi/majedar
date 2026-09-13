import { z } from 'zod';
import { objectIdRegex } from './category.validator.js';

export const menuIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid menu item ID format'),
});

const coerceBoolean = z.union([
    z.boolean(),
    z.string().transform((val) => val === 'true' || val === '1'),
]);

const coercePositiveNumber = z.union([
    z.number().positive('Price must be greater than 0'),
    z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, {
        message: 'Price must be a positive number greater than 0',
    }),
]);

export const createMenuItemSchema = z
    .object({
        name: z
            .string({ required_error: 'Menu item name is required' })
            .trim()
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name cannot exceed 100 characters'),
        description: z
            .string({ required_error: 'Description is required' })
            .trim()
            .min(5, 'Description must be at least 5 characters long')
            .max(1000, 'Description cannot exceed 1000 characters'),
        price: coercePositiveNumber,
        category: z
            .string({ required_error: 'Category ID is required' })
            .regex(objectIdRegex, 'Category must be a valid ID'),
        isVeg: coerceBoolean.optional(),
        isBestseller: coerceBoolean.optional(),
        isAvailable: coerceBoolean.optional(),
        image: z
            .object({
                url: z.string().url('Invalid image URL').optional().nullable(),
                publicId: z.string().optional().nullable(),
            })
            .optional()
            .nullable(),
    })
    .strip();

export const updateMenuItemSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name cannot exceed 100 characters')
            .optional(),
        description: z
            .string()
            .trim()
            .min(5, 'Description must be at least 5 characters long')
            .max(1000, 'Description cannot exceed 1000 characters')
            .optional(),
        price: coercePositiveNumber.optional(),
        category: z
            .string()
            .regex(objectIdRegex, 'Category must be a valid ID')
            .optional(),
        isVeg: coerceBoolean.optional(),
        isBestseller: coerceBoolean.optional(),
        isAvailable: coerceBoolean.optional(),
        image: z
            .object({
                url: z.string().url('Invalid image URL').optional().nullable(),
                publicId: z.string().optional().nullable(),
            })
            .optional()
            .nullable(),
    })
    .strip();

export const menuQuerySchema = z
    .object({
        category: z.string().trim().optional(),
        search: z.string().trim().optional(),
        isBestseller: coerceBoolean.optional(),
        isVeg: coerceBoolean.optional(),
        isAvailable: coerceBoolean.optional(),
        sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).optional(),
    })
    .strip();
