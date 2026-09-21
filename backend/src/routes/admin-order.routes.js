import { Router } from 'express';
import {
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    orderIdParamSchema,
    updateOrderStatusSchema,
    orderQuerySchema,
} from '../validators/order.validator.js';

const router = Router();

// Protect all admin order routes with admin authentication and authorization
router.use(authenticateAdmin, requireAdmin);

// Admin order management endpoints
router.get('/', validate(orderQuerySchema, 'query'), getAdminOrders);
router.get('/:id', validate(orderIdParamSchema, 'params'), getAdminOrderById);
router.patch(
    '/:id/status',
    validate(orderIdParamSchema, 'params'),
    validate(updateOrderStatusSchema, 'body'),
    updateOrderStatus
);

export default router;
