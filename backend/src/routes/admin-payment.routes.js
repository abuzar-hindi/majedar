import { Router } from 'express';
import {
    getAdminPayments,
    getAdminOrderPayments,
    initiateRefund,
} from '../controllers/payment.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    adminPaymentQuerySchema,
    paymentAttemptIdParamSchema,
    orderIdParamForPaymentsSchema,
    refundSchema,
} from '../validators/payment.validator.js';

const router = Router();

// All admin payment routes require admin authentication and authorization
router.use(authenticateAdmin, requireAdmin);

// List all payment attempts (each attempt shown individually)
router.get(
    '/',
    validate(adminPaymentQuerySchema, 'query'),
    getAdminPayments
);

// Get all payment attempts for a specific order (shows full retry history)
router.get(
    '/order/:orderId',
    validate(orderIdParamForPaymentsSchema, 'params'),
    getAdminOrderPayments
);

// Initiate a refund for a specific paid PaymentAttempt
router.post(
    '/:attemptId/refund',
    validate(paymentAttemptIdParamSchema, 'params'),
    validate(refundSchema, 'body'),
    initiateRefund
);

export default router;
