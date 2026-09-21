import express from 'express';
import { submitMessage } from '../controllers/message.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { createMessageSchema } from '../validators/message.validator.js';
import { authenticateCustomer } from '../middleware/customer-auth.middleware.js';
import { contactMessageLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

/**
 * Customer contact message submission
 * Authenticated via customer_token cookie, rate limited, and Zod validated
 */
router.post(
    '/',
    contactMessageLimiter,
    authenticateCustomer,
    validate(createMessageSchema, 'body'),
    submitMessage
);

export default router;
