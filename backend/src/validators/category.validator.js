import { z } from 'zod';

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const categoryIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid category ID format'),
});

export const createCategorySchema = z
    .object({
        name: z
            .string({ required_error: 'Category name is required' })
            .trim()
            .min(2, 'Category name must be at least 2 characters long')
            .max(50, 'Category name cannot exceed 50 characters'),
        slug: z
            .string()
            .trim()
            .optional(),
        isActive: z
            .union([z.boolean(), z.string().transform((val) => val === 'true')])
            .optional(),
        sortOrder: z
            .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
            .optional(),
        image: z
            .object({
                url: z.string().url('Invalid image URL').optional().nullable(),
                publicId: z.string().optional().nullable(),
            })
            .optional()
            .nullable(),
    })
    .strip();

export const updateCategorySchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Category name must be at least 2 characters long')
            .max(50, 'Category name cannot exceed 50 characters')
            .optional(),
        slug: z
            .string()
            .trim()
            .optional(),
        isActive: z
            .union([z.boolean(), z.string().transform((val) => val === 'true')])
            .optional(),
        sortOrder: z
            .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
            .optional(),
        image: z
            .object({
                url: z.string().url('Invalid image URL').optional().nullable(),
                publicId: z.string().optional().nullable(),
            })
            .optional()
            .nullable(),
    })
    .strip();
