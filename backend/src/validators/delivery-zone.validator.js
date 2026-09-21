import { z } from 'zod';
import { objectIdRegex } from './category.validator.js';

export const zoneIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid delivery zone ID format'),
});

const ZONE_FEE_MAP = {
    '0-3km': 15,
    '3-5km': 30,
};

export const createDeliveryZoneSchema = z
    .object({
        name: z
            .string({ required_error: 'Area name is required' })
            .trim()
            .min(2, 'Area name must be at least 2 characters long')
            .max(100, 'Area name cannot exceed 100 characters'),
        type: z.enum(['0-3km', '3-5km'], {
            required_error: 'Zone type is required (0-3km or 3-5km)',
        }),
        deliveryFee: z
            .union([
                z.number(),
                z.string().transform((v) => parseInt(v, 10)),
            ])
            .optional(),
        isActive: z.boolean().optional().default(true),
        sortOrder: z
            .union([
                z.number().int(),
                z.string().transform((v) => parseInt(v, 10)),
            ])
            .optional()
            .default(0),
    })
    .refine(
        (data) => {
            if (data.deliveryFee !== undefined) {
                return data.deliveryFee === ZONE_FEE_MAP[data.type];
            }
            return true;
        },
        {
            message: 'Delivery fee must correspond to zone type: ₹15 for 0-3km, ₹30 for 3-5km',
            path: ['deliveryFee'],
        }
    )
    .transform((data) => ({
        ...data,
        deliveryFee: data.deliveryFee !== undefined ? data.deliveryFee : ZONE_FEE_MAP[data.type],
    }));

export const updateDeliveryZoneSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Area name must be at least 2 characters long')
            .max(100, 'Area name cannot exceed 100 characters')
            .optional(),
        type: z.enum(['0-3km', '3-5km']).optional(),
        deliveryFee: z
            .union([
                z.number(),
                z.string().transform((v) => parseInt(v, 10)),
            ])
            .optional(),
        isActive: z.boolean().optional(),
        sortOrder: z
            .union([
                z.number().int(),
                z.string().transform((v) => parseInt(v, 10)),
            ])
            .optional(),
    })
    .refine(
        (data) => {
            if (data.type && data.deliveryFee !== undefined) {
                return data.deliveryFee === ZONE_FEE_MAP[data.type];
            }
            return true;
        },
        {
            message: 'Delivery fee must correspond to zone type: ₹15 for 0-3km, ₹30 for 3-5km',
            path: ['deliveryFee'],
        }
    )
    .transform((data) => {
        if (data.type && data.deliveryFee === undefined) {
            return {
                ...data,
                deliveryFee: ZONE_FEE_MAP[data.type],
            };
        }
        return data;
    });
