import { Router } from 'express';
import {
    createOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    reportOrderIssue,
} from '../controllers/order.controller.js';
import { authenticateCustomer } from '../middleware/customer-auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    createOrderSchema,
    orderIdParamSchema,
    reportOrderIssueSchema,
} from '../validators/order.validator.js';

const router = Router();

// Protect all customer order routes with customer authentication
router.use(authenticateCustomer);

// Order creation & customer history endpoints
router.post('/', validate(createOrderSchema, 'body'), createOrder);
router.get('/my', getMyOrders);
router.get('/:id', validate(orderIdParamSchema, 'params'), getMyOrderById);
router.post('/:id/cancel', validate(orderIdParamSchema, 'params'), cancelMyOrder);
router.post(
    '/:id/report-issue',
    validate(orderIdParamSchema, 'params'),
    validate(reportOrderIssueSchema, 'body'),
    reportOrderIssue
);

export default router;
