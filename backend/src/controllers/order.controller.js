import * as orderService from '../services/order/order.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Customer: Create a new order with items and delivery details.
 */
export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.customer._id, req.body);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Order placed successfully',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Customer: View customer's own order history.
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getCustomerOrders(req.customer._id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Order history retrieved successfully',
            data: { orders },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Customer: View specific order belonging to the customer.
 */
export const getMyOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getCustomerOrderById(req.customer._id, req.params.id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Order details retrieved successfully',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: View all orders with optional filters.
 */
export const getAdminOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAdminOrders(req.query);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Orders retrieved successfully',
            data: { orders },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: View single order details.
 */
export const getAdminOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getAdminOrderById(req.params.id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Order details retrieved successfully',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Update order status (placed, preparing, completed, cancelled) and/or payment status.
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Order status updated successfully',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Customer: Cancel order before restaurant starts preparing.
 */
export const cancelMyOrder = async (req, res, next) => {
    try {
        const order = await orderService.cancelCustomerOrder(req.params.id, req.customer._id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Order cancelled successfully',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Customer: Report an issue with an order.
 */
export const reportOrderIssue = async (req, res, next) => {
    try {
        const message = await orderService.reportOrderIssue(
            req.params.id,
            req.customer._id,
            req.body
        );
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Your issue has been reported to the restaurant team',
            data: { message },
        });
    } catch (error) {
        next(error);
    }
};

