import { z } from 'zod';
import { objectIdRegex } from './category.validator.js';

// Reusable ObjectId validation
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ID format');

/**
 * Schema for initiating a payment (POST /api/payments/razorpay/create).
 * Frontend sends the application Order ID; backend recalculates everything.
 */
export const createPaymentSchema = z.object({
    orderId: objectIdSchema.describe('Application Order ID'),
}).strip();

/**
 * Schema for verifying a payment after Razorpay Checkout completes.
 * All three fields are required for HMAC signature verification.
 */
export const verifyPaymentSchema = z.object({
    razorpayOrderId: z
        .string({ required_error: 'Razorpay Order ID is required' })
        .trim()
        .min(1, 'Razorpay Order ID cannot be empty'),
    razorpayPaymentId: z
        .string({ required_error: 'Razorpay Payment ID is required' })
        .trim()
        .min(1, 'Razorpay Payment ID cannot be empty'),
    razorpaySignature: z
        .string({ required_error: 'Razorpay signature is required' })
        .trim()
        .min(1, 'Razorpay signature cannot be empty'),
}).strip();

/**
 * Schema for the orderId path parameter on retry endpoint.
 */
export const retryPaymentParamSchema = z.object({
    orderId: objectIdSchema,
});

/**
 * Schema for initiating a refund (admin only).
 * Amount in paise (integer) to prevent floating-point issues.
 */
export const refundSchema = z.object({
    amountInPaise: z
        .number({ required_error: 'Refund amount in paise is required' })
        .int('Refund amount must be an integer')
        .min(1, 'Refund amount must be at least 1 paise'),
    reason: z
        .string()
        .trim()
        .max(200, 'Reason cannot exceed 200 characters')
        .optional(),
}).strip();

/**
 * Schema for admin payment list query parameters.
 */
export const adminPaymentQuerySchema = z.object({
    status: z.enum(['created', 'pending', 'paid', 'failed', 'refunded']).optional(),
    method: z.string().trim().optional(),
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
}).strip();

/**
 * Schema for paymentAttemptId path parameter (admin refund).
 */
export const paymentAttemptIdParamSchema = z.object({
    attemptId: objectIdSchema,
});

/**
 * Schema for orderId path parameter in admin order payment history.
 */
export const orderIdParamForPaymentsSchema = z.object({
    orderId: objectIdSchema,
});
