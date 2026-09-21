import mongoose from 'mongoose';

/**
 * PaymentAttempt: records every individual payment attempt for an application Order.
 *
 * One restaurant Order can have multiple PaymentAttempts:
 *   Order #MD-001
 *     Attempt 1 → failed
 *     Attempt 2 → failed
 *     Attempt 3 → paid   ← authoritative payment
 *
 * Old failed attempts are preserved for audit and never overwritten.
 * The application Order's paymentStatus is updated only on the authoritative successful attempt.
 */
const paymentAttemptSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order reference is required'],
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer reference is required'],
            index: true,
        },

        // Razorpay-specific fields
        razorpayOrderId: {
            type: String,
            required: [true, 'Razorpay Order ID is required'],
            unique: true,
            index: true,
            trim: true,
        },
        razorpayPaymentId: {
            type: String,
            default: null,
            trim: true,
        },
        // Signature stored for audit but never returned to clients
        razorpaySignature: {
            type: String,
            default: null,
            select: false, // Never returned by default
        },

        // Financial fields — always in paise (integer), never fractional
        amount: {
            type: Number,
            required: [true, 'Payment amount in paise is required'],
            min: [0, 'Amount cannot be negative'],
        },
        currency: {
            type: String,
            default: 'INR',
            uppercase: true,
            trim: true,
        },

        // Payment lifecycle status
        status: {
            type: String,
            enum: {
                values: ['created', 'pending', 'paid', 'failed', 'refunded'],
                message: '{VALUE} is not a valid payment status',
            },
            default: 'created',
            index: true,
        },

        // Payment method captured from Razorpay (card, upi, netbanking, etc.)
        method: {
            type: String,
            default: null,
            trim: true,
        },

        // Human-readable failure reason — never exposes internal Razorpay errors
        failureReason: {
            type: String,
            default: null,
            trim: true,
        },

        // Idempotency: marks whether the webhook for this attempt has been processed
        webhookProcessed: {
            type: Boolean,
            default: false,
            index: true,
        },
        webhookEvent: {
            type: String,
            default: null,
        },
        pushNotificationSent: {
            type: Boolean,
            default: false,
            index: true,
        },

        // Refund tracking
        refundId: {
            type: String,
            default: null,
            trim: true,
        },
        refundAmount: {
            type: Number,
            default: null, // in paise
        },
        refundStatus: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.razorpaySignature; // Never expose signature in JSON
                return ret;
            },
        },
        toObject: {
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.razorpaySignature;
                return ret;
            },
        },
    }
);

// Compound indexes for common queries
paymentAttemptSchema.index({ order: 1, status: 1 });
paymentAttemptSchema.index({ order: 1, createdAt: -1 });
paymentAttemptSchema.index({ customer: 1, createdAt: -1 });
// Note: razorpayOrderId unique index is declared via `unique: true` on the field above

export const PaymentAttempt = mongoose.model('PaymentAttempt', paymentAttemptSchema);