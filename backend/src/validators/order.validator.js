import { z } from 'zod';
import { objectIdRegex } from './category.validator.js';

export const orderIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID format'),
});

const deliveryInstructionsEnum = z.enum([
    'Call on arrival',
    'Leave at the gate',
    "Don't ring the bell",
    'Other',
]);

const orderItemInputSchema = z.object({
    menuItem: z
        .string({ required_error: 'Menu item ID is required' })
        .regex(objectIdRegex, 'Invalid menu item ID format'),
    variant: z.enum(['single', 'half', 'full']).optional().default('single'),
    quantity: z
        .union([
            z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
            z.string().transform((val) => parseInt(val, 10)).refine((val) => Number.isInteger(val) && val >= 1, {
                message: 'Quantity must be an integer of at least 1',
            }),
        ]),
});

const deliveryAddressInputSchema = z
    .object({
        firstName: z
            .string({ required_error: 'First name is required' })
            .trim()
            .min(1, 'First name cannot be empty')
            .max(50, 'First name cannot exceed 50 characters'),
        lastName: z
            .string({ required_error: 'Last name is required' })
            .trim()
            .min(1, 'Last name cannot be empty')
            .max(50, 'Last name cannot exceed 50 characters'),
        phone: z
            .string({ required_error: 'Phone number is required' })
            .trim()
            .min(7, 'Phone number must be at least 7 digits')
            .max(16, 'Phone number cannot exceed 16 digits'),
        email: z
            .string({ required_error: 'Email is required' })
            .trim()
            .email('Invalid email address')
            .toLowerCase(),
        address: z
            .string({ required_error: 'Delivery street address is required' })
            .trim()
            .min(3, 'Address must be at least 3 characters long')
            .max(300, 'Address cannot exceed 300 characters'),
        landmark: z
            .string()
            .trim()
            .max(100, 'Landmark cannot exceed 100 characters')
            .optional()
            .nullable(),
        area: z
            .string()
            .trim()
            .max(100, 'Area cannot exceed 100 characters')
            .optional()
            .nullable(),
        deliveryZoneId: z
            .string()
            .regex(objectIdRegex, 'Invalid delivery zone ID format')
            .optional()
            .nullable(),
        deliveryInstructions: deliveryInstructionsEnum.optional().nullable(),
        deliveryInstructionOther: z
            .string()
            .trim()
            .max(200, 'Instructions cannot exceed 200 characters')
            .optional()
            .nullable(),
    })
    .refine(
        (data) => {
            if (data.deliveryInstructions === 'Other') {
                return typeof data.deliveryInstructionOther === 'string' && data.deliveryInstructionOther.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Please provide details for "Other" delivery instruction',
            path: ['deliveryInstructionOther'],
        }
    );

export const createOrderSchema = z
    .object({
        items: z
            .array(orderItemInputSchema, { required_error: 'Order items are required' })
            .min(1, 'Order must contain at least one item'),
        deliveryAddress: deliveryAddressInputSchema,
        orderType: z.enum(['delivery', 'pickup', 'dine_in']).optional().default('delivery'),
        paymentMethod: z.enum(['cod', 'razorpay']).optional().default('cod'),
        deliveryZoneId: z
            .string()
            .regex(objectIdRegex, 'Invalid delivery zone ID format')
            .optional()
            .nullable(),
        deliveryFee: z
            .union([
                z.number().nonnegative(),
                z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0, {
                    message: 'Delivery fee must be a non-negative number',
                }),
            ])
            .optional(),
    })
    .strip();

export const updateOrderStatusSchema = z
    .object({
        orderStatus: z.enum(['placed', 'preparing', 'completed', 'cancelled'], {
            required_error: 'Order status is required',
        }),
        paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    })
    .strip();

export const orderQuerySchema = z
    .object({
        orderStatus: z.enum(['placed', 'preparing', 'completed', 'cancelled']).optional(),
        paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
        page: z
            .union([
                z.number().int().min(1),
                z.string().transform((v) => parseInt(v, 10)),
            ])
            .optional(),
        limit: z
            .union([
                z.number().int().min(1).max(100),
                z.string().transform((v) => parseInt(v, 10)),
            ])
            .optional(),
    })
    .strip();

export const reportOrderIssueSchema = z
    .object({
        issueType: z.enum(
            ['wrong_item', 'missing_item', 'damaged_spilled', 'payment_issue', 'delivery_issue', 'other'],
            { required_error: 'Issue type is required' }
        ),
        description: z
            .string({ required_error: 'Description is required' })
            .trim()
            .min(5, 'Description must be at least 5 characters long')
            .max(2000, 'Description cannot exceed 2000 characters'),
    })
    .strip();

