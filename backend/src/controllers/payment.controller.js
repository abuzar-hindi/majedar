import * as paymentService from '../services/payments/payment-verification.service.js';
import { sendSuccess } from '../utils/response.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

// ─────────────────────────────────────────────────────────
// CUSTOMER PAYMENT ENDPOINTS
// ─────────────────────────────────────────────────────────

/**
 * POST /api/payments/razorpay/create
 * Create a Razorpay Order for an existing application Order.
 * Returns Razorpay checkout configuration to the frontend.
 *
 * The amount is derived exclusively from the backend-computed order total.
 * Frontend NEVER computes or sends the amount.
 */
export const createPayment = async (req, res, next) => {
    try {
        const result = await paymentService.initiatePayment(req.customer._id, req.body.orderId);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Payment order created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/payments/razorpay/verify
 * Verify a completed Razorpay payment using cryptographic HMAC signature.
 *
 * This is the ONLY way an order becomes paid — never based on frontend assertion.
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const order = await paymentService.verifyPayment(req.customer._id, {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Payment verified successfully. Your order is confirmed.',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/payments/razorpay/retry/:orderId
 * Create a fresh PaymentAttempt + Razorpay Order for an existing unpaid application Order.
 * Called when: previous payment failed, was abandoned, or expired.
 */
export const retryPayment = async (req, res, next) => {
    try {
        const result = await paymentService.retryPayment(req.customer._id, req.params.orderId);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'New payment attempt created. Please complete your payment.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────
// WEBHOOK (no authentication — uses HMAC verification instead)
// ─────────────────────────────────────────────────────────

/**
 * POST /api/payments/razorpay/webhook
 * Handles Razorpay server-to-server payment events.
 *
 * CRITICAL: This handler receives the raw request body (Buffer) before JSON parsing.
 * Webhook signature is verified using HMAC SHA256 with RAZORPAY_WEBHOOK_SECRET.
 *
 * This is what handles the "payment succeeds but browser closes" scenario:
 * Razorpay will POST this webhook regardless of what happens in the browser.
 */
export const handleWebhook = async (req, res, next) => {
    try {
        const razorpaySignature = req.headers['x-razorpay-signature'];
        if (!razorpaySignature) {
            // Always respond 200 to Razorpay even if we reject, to prevent retries on bad requests
            return res.status(400).json({ success: false, message: 'Missing webhook signature.' });
        }

        // req.body at this point is the raw Buffer (set by express.raw() in app.js)
        await paymentService.handleWebhookEvent(req.body, razorpaySignature);

        // Razorpay expects a 200 response — any other status triggers retries
        return res.status(200).json({ success: true, message: 'Webhook processed.' });
    } catch (error) {
        // Log internally but always respond 200 to Razorpay to prevent flood of retries
        console.error('[Webhook Error]:', error.message);

        if (error.name === 'UnauthorizedError' || error.statusCode === 401) {
            return res.status(401).json({ success: false, message: 'Webhook signature verification failed.' });
        }

        // Return 200 for processing errors — webhook will not retry for 200 responses
        return res.status(200).json({ success: true, message: 'Webhook acknowledged.' });
    }
};

// ─────────────────────────────────────────────────────────
// ADMIN PAYMENT ENDPOINTS
// ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/payments
 * List all payment attempts with optional filters.
 * Each row is a PaymentAttempt (not an Order) — multiple attempts per order are shown separately.
 */
export const getAdminPayments = async (req, res, next) => {
    try {
        const result = await paymentService.getAllPaymentAttempts(req.query);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Payment attempts retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/payments/order/:orderId
 * Get all payment attempts for a specific order.
 * Shows attempt history: Attempt 1 → failed, Attempt 2 → paid, etc.
 */
export const getAdminOrderPayments = async (req, res, next) => {
    try {
        const attempts = await paymentService.getPaymentAttemptsByOrder(req.params.orderId);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Order payment attempts retrieved successfully',
            data: { attempts },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/payments/:attemptId/refund
 * Initiate a refund for a paid PaymentAttempt via Razorpay API.
 *
 * Security:
 *  - Only admin can initiate refunds
 *  - Backend validates amount (never trusts frontend amount)
 *  - Prevents duplicate refunds
 */
export const initiateRefund = async (req, res, next) => {
    try {
        const { amountInPaise } = req.body;
        const attempt = await paymentService.initiateRefund(req.params.attemptId, amountInPaise);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Refund initiated successfully',
            data: { attempt },
        });
    } catch (error) {
        next(error);
    }
};
