import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import { MenuItem } from '../../models/MenuItem.js';
import { DeliveryZone } from '../../models/DeliveryZone.js';
import { PaymentAttempt } from '../../models/Payment.js';
import { Message } from '../../models/Message.js';
import { Customer } from '../../models/Customer.js';
import {
    restaurantConfig,
    isRestaurantOpen,
    calculateDeliveryFee,
} from '../../config/restaurant.config.js';
import { generateOrderNumber } from '../../utils/generate-order-number.js';
import {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} from '../../utils/errors.js';
import { sendAdminPushNotification } from '../notifications/admin-push.service.js';
import { initiateRefund } from '../payments/payment-verification.service.js';

export const createOrder = async (customerId, orderData) => {
    // 1. Restaurant operational check
    if (!isRestaurantOpen()) {
        throw new BadRequestError('The restaurant is currently closed and not accepting orders.');
    }

    // 2. Consolidate requested items by (menuItemId + variant) to handle duplicate variants gracefully
    const itemVariantMap = new Map();
    const uniqueItemIdsSet = new Set();

    for (const item of orderData.items) {
        const id = item.menuItem.toString();
        const variant = item.variant || 'single';
        const key = `${id}__${variant}`;

        uniqueItemIdsSet.add(id);
        const existing = itemVariantMap.get(key) || { menuItemId: id, variant, quantity: 0 };
        existing.quantity += item.quantity;
        itemVariantMap.set(key, existing);
    }
    const uniqueItemIds = Array.from(uniqueItemIdsSet);

    // 3. Fetch all requested MenuItems from MongoDB in a single query
    const menuItems = await MenuItem.find({ _id: { $in: uniqueItemIds } });
    const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

    // 4. Verify all items exist in database
    if (menuItems.length !== uniqueItemIds.length) {
        const foundIds = new Set(menuItems.map((item) => item._id.toString()));
        const missingIds = uniqueItemIds.filter((id) => !foundIds.has(id));
        throw new NotFoundError(`Menu item(s) not found: ${missingIds.join(', ')}`);
    }

    // 5. Verify every item is available
    for (const menuItem of menuItems) {
        if (!menuItem.isAvailable) {
            throw new BadRequestError(`Menu item "${menuItem.name}" is currently unavailable`);
        }
    }

    // 6 & 7. Calculate item subtotals using CURRENT database price per variant (strictly ignoring client prices)
    let subtotal = 0;
    const orderItemSnapshots = [];

    for (const { menuItemId, variant, quantity } of itemVariantMap.values()) {
        const menuItem = menuItemMap.get(menuItemId);
        const pricingType = menuItem.pricingType || 'single';

        let unitPrice;
        if (pricingType === 'single') {
            if (variant !== 'single') {
                throw new BadRequestError(
                    `Item "${menuItem.name}" only supports single pricing, but received variant "${variant}"`
                );
            }
            unitPrice = menuItem.price;
        } else if (pricingType === 'half-full') {
            if (variant === 'half') {
                unitPrice = menuItem.halfPrice;
            } else if (variant === 'full') {
                unitPrice = menuItem.fullPrice;
            } else {
                throw new BadRequestError(
                    `Item "${menuItem.name}" requires a "half" or "full" variant, but received "${variant}"`
                );
            }
        }

        if (unitPrice === undefined || unitPrice === null || unitPrice <= 0) {
            throw new BadRequestError(
                `Price configuration missing or invalid for item "${menuItem.name}" (variant: ${variant})`
            );
        }

        const itemSubtotal = unitPrice * quantity;
        subtotal += itemSubtotal;

        orderItemSnapshots.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            variant,
            unitPrice,
            price: unitPrice,
            quantity,
            image: menuItem.image?.url || null,
            subtotal: itemSubtotal,
        });
    }

    // 8. Check minimum order amount threshold
    if (subtotal < restaurantConfig.minimumOrderAmount) {
        throw new BadRequestError(
            `Minimum order amount is ₹${restaurantConfig.minimumOrderAmount}. Current subtotal is ₹${subtotal}.`
        );
    }

    // 9 & 10. Calculate delivery fee, GST, and authoritative total
    const orderType = orderData.orderType || 'delivery';
    let deliveryFee = 0;
    let gst = 0;
    const deliveryAddress = orderData.deliveryAddress ? { ...orderData.deliveryAddress } : {};
    const zoneId = orderData.deliveryZoneId || deliveryAddress.deliveryZoneId;

    if (orderType === 'delivery') {
        if (zoneId) {
            // Find DeliveryZone in database
            const zone = await DeliveryZone.findById(zoneId);
            if (!zone) {
                throw new NotFoundError('Selected delivery zone not found');
            }
            if (!zone.isActive) {
                throw new BadRequestError('Selected delivery zone is currently inactive');
            }

            // Strictly read deliveryFee from database - ignore client-sent fees
            deliveryFee = zone.deliveryFee;

            // Snapshot area and zone ID onto the delivery address
            deliveryAddress.area = zone.name;
            deliveryAddress.deliveryZoneId = zone._id;

            // Authoritative 5% GST strictly on items subtotal (not delivery fee)
            gst = Math.round(subtotal * 0.05 * 100) / 100;
        } else {
            // Fallback for legacy orders without zone selection
            deliveryFee = calculateDeliveryFee({
                orderType,
                subtotal,
                address: deliveryAddress,
                selectedDeliveryFee: orderData.deliveryFee,
            });
        }
    }

    const total = Math.round((subtotal + gst + deliveryFee) * 100) / 100;

    // 11. Generate unique customer-facing order reference
    const orderNumber = generateOrderNumber();

    // 12 & 13. Persist order with immutable snapshots and initial statuses
    const order = new Order({
        orderNumber,
        customer: customerId,
        items: orderItemSnapshots,
        deliveryAddress,
        orderType,
        subtotal,
        gst,
        deliveryFee,
        total,
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: 'pending',
        orderStatus: 'placed',
    });

    await order.save();

    // Trigger admin push notification for new order (idempotent & non-blocking)
    try {
        if (mongoose.connection?.readyState === 1) {
            const claimed = await Order.findOneAndUpdate(
                { _id: order._id, pushNotificationSent: false },
                { pushNotificationSent: true },
                { new: true }
            );
            if (claimed) {
                sendAdminPushNotification({
                    type: 'NEW_ORDER',
                    title: 'New Order — Majedaar',
                    body: `Order #${order.orderNumber} • ₹${Number(order.total).toFixed(2)}`,
                    url: `/dashboard/orders/${order._id}`,
                    data: {
                        orderId: order._id.toString(),
                        orderNumber: order.orderNumber,
                        total: order.total,
                    },
                }).catch((err) => {
                    console.error('[OrderService] Push notification error:', err.message);
                });
            }
        }
    } catch (pushErr) {
        console.error('[OrderService] Push claim error:', pushErr.message);
    }

    return order;
};

/**
 * Retrieve all orders belonging to the authenticated customer.
 * 
 * @param {string|mongoose.Types.ObjectId} customerId 
 * @returns {Promise<Array<Order>>}
 */
export const getCustomerOrders = async (customerId) => {
    return Order.find({ customer: customerId }).sort({ createdAt: -1 });
};

/**
 * Retrieve a single order for the authenticated customer.
 * Prevents customers from accessing orders belonging to others.
 * 
 * @param {string|mongoose.Types.ObjectId} customerId 
 * @param {string} orderId 
 * @returns {Promise<Order>}
 */
export const getCustomerOrderById = async (customerId, orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (order.customer.toString() !== customerId.toString()) {
        throw new ForbiddenError('You do not have permission to access this order');
    }

    return order;
};

/**
 * Retrieve orders for admin with optional filters.
 * 
 * @param {Object} queryFilters 
 * @returns {Promise<Array<Order>>}
 */
export const getAdminOrders = async (queryFilters = {}) => {
    const filter = {};

    if (queryFilters.orderStatus) {
        filter.orderStatus = queryFilters.orderStatus;
    }

    if (queryFilters.paymentStatus) {
        filter.paymentStatus = queryFilters.paymentStatus;
    }

    return Order.find(filter)
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 });
};

/**
 * Retrieve single order details for admin.
 * 
 * @param {string} orderId 
 * @returns {Promise<Order>}
 */
export const getAdminOrderById = async (orderId) => {
    const order = await Order.findById(orderId).populate('customer', 'name email phone');
    if (!order) {
        throw new NotFoundError('Order not found');
    }
    return order;
};

/**
 * Update order status or payment status by admin.
 * Maintains independence between paymentStatus and orderStatus.
 * 
 * @param {string} orderId 
 * @param {Object} updates 
 * @param {string} [updates.orderStatus]
 * @param {string} [updates.paymentStatus]
 * @returns {Promise<Order>}
 */
export const updateOrderStatus = async (orderId, { orderStatus, paymentStatus }) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (orderStatus) {
        order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;
    }

    await order.save();
    return order;
};

/**
 * Cancel an order by the owning customer.
 * Allowed ONLY when orderStatus is 'placed' (before kitchen preparation starts).
 * For paid online Razorpay orders, safely triggers refund.
 * 
 * @param {string} orderId 
 * @param {string} customerId 
 * @returns {Promise<Order>}
 */
export const cancelCustomerOrder = async (orderId, customerId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (order.customer.toString() !== customerId.toString()) {
        throw new ForbiddenError('You are not authorized to cancel this order');
    }

    if (order.orderStatus === 'cancelled') {
        throw new BadRequestError('This order is already cancelled.');
    }

    if (order.orderStatus !== 'placed') {
        throw new BadRequestError('Order cannot be cancelled once preparation has started.');
    }

    // If online paid via Razorpay, trigger refund safely using existing architecture
    if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {
        const paidAttempt = await PaymentAttempt.findOne({
            order: order._id,
            status: 'paid',
        });

        if (paidAttempt && !paidAttempt.refundId) {
            await initiateRefund(paidAttempt._id, paidAttempt.amount);
            order.paymentStatus = 'refunded';
        }
    }

    order.orderStatus = 'cancelled';
    await order.save();
    return order;
};

/**
 * Report an issue with an order.
 * Customer must be the owner of the order.
 * 
 * @param {string} orderId 
 * @param {string} customerId 
 * @param {Object} issueData
 * @param {string} issueData.issueType
 * @param {string} issueData.description
 * @returns {Promise<Message>}
 */
export const reportOrderIssue = async (orderId, customerId, { issueType, description }) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (order.customer.toString() !== customerId.toString()) {
        throw new ForbiddenError('You are not authorized to report an issue for this order');
    }

    const customer = await Customer.findById(customerId);
    const senderName = customer?.name?.trim() || order.customerInfo?.name || 'Customer';
    const senderEmail = customer?.email?.trim() || '';
    const senderPhone = customer?.phone?.trim() || order.customerInfo?.phone || '';

    // Spam / duplicate prevention: 60s check for same order and issue description
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentDuplicate = await Message.findOne({
        customer: customerId,
        order: order._id,
        message: description.trim(),
        createdAt: { $gte: oneMinuteAgo },
    });

    if (recentDuplicate) {
        throw new BadRequestError('We have already received this issue report. Please wait before submitting again.');
    }

    const issueMessage = new Message({
        customer: customerId,
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        type: 'order_issue',
        order: order._id,
        orderNumber: order.orderNumber,
        issueType,
        message: description.trim(),
        status: 'new',
    });

    await issueMessage.save();
    return issueMessage;
};

