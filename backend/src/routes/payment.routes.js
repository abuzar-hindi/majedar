import { Router } from 'express';
import {
    createPayment,
    verifyPayment,
    retryPayment,
    handleWebhook,
} from '../controllers/payment.controller.js';
import { authenticateCustomer } from '../middleware/customer-auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { paymentLimiter } from '../middleware/rate-limit.middleware.js';
import {
    createPaymentSchema,
    verifyPaymentSchema,
    retryPaymentParamSchema,
} from '../validators/payment.validator.js';

const router = Router();

// ─────────────────────────────────────────────────────────
// WEBHOOK — No JWT auth; uses Razorpay HMAC signature verification.
// CRITICAL: This route must receive the RAW body (Buffer).
//           express.raw() is applied at app.js level for this specific path.
// ─────────────────────────────────────────────────────────
router.post('/webhook', handleWebhook);

// ─────────────────────────────────────────────────────────
// CUSTOMER PAYMENT ROUTES — Require authenticated customer session
// ─────────────────────────────────────────────────────────
router.use(authenticateCustomer);

// Create Razorpay Order for an existing application Order
router.post(
    '/create',
    paymentLimiter,
    validate(createPaymentSchema, 'body'),
    createPayment
);

// Verify payment signature after Razorpay Checkout completes
router.post(
    '/verify',
    paymentLimiter,
    validate(verifyPaymentSchema, 'body'),
    verifyPayment
);

// Create a new payment attempt for a previously failed/abandoned payment
router.post(
    '/retry/:orderId',
    paymentLimiter,
    validate(retryPaymentParamSchema, 'params'),
    retryPayment
);

export default router;
