import { Router } from 'express';
import {
    createReviewHandler,
    getMenuItemReviewsHandler,
} from '../controllers/review.controller.js';
import { authenticateCustomer } from '../middleware/customer-auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    createReviewSchema,
    menuItemIdParamSchema,
    reviewQuerySchema,
} from '../validators/review.validator.js';

const router = Router();

// Customer: Create a review for a completed order item
router.post(
    '/',
    authenticateCustomer,
    validate(createReviewSchema, 'body'),
    createReviewHandler
);

// Public: Get reviews for a menu item
router.get(
    '/menu/:menuItemId',
    validate(menuItemIdParamSchema, 'params'),
    validate(reviewQuerySchema, 'query'),
    getMenuItemReviewsHandler
);

export default router;
