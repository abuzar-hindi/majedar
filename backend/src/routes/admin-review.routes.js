import { Router } from 'express';
import {
    getAdminReviewsHandler,
    deleteReviewHandler,
} from '../controllers/review.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    reviewIdParamSchema,
    reviewQuerySchema,
} from '../validators/review.validator.js';

const router = Router();

// Protect all admin review routes
router.use(authenticateAdmin, requireAdmin);

// Admin: View all customer reviews
router.get('/', validate(reviewQuerySchema, 'query'), getAdminReviewsHandler);

// Admin: Delete an inappropriate review
router.delete('/:id', validate(reviewIdParamSchema, 'params'), deleteReviewHandler);

export default router;
