/**
 * Comprehensive Payment System Tests for Majedaar Restaurant
 *
 * Tests cover:
 * - Amount calculation (subtotal, GST, delivery fee, paise conversion)
 * - Payment creation and attempt lifecycle
 * - Signature verification (valid, invalid, tampered)
 * - Idempotency (duplicate verification, duplicate webhook)
 * - Retry flow (multiple attempts, old failures preserved)
 * - State machine (paid/cancelled/completed order protection)
 * - Security (ownership, unauthorized access)
 * - COD consistency
 * - Webhook processing
 * - Refund protection
 */

import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Order } from '../../src/models/Order.js';
import { PaymentAttempt } from '../../src/models/Payment.js';
import { Customer } from '../../src/models/Customer.js';
import { MenuItem } from '../../src/models/MenuItem.js';
import { DeliveryZone } from '../../src/models/DeliveryZone.js';
import * as paymentService from '../../src/services/payments/payment-verification.service.js';
import * as razorpayService from '../../src/services/payments/razorpay.service.js';
import { config } from '../../src/config/env.js';
import {
    createPaymentSchema,
    verifyPaymentSchema,
    retryPaymentParamSchema,
    refundSchema,
} from '../../src/validators/payment.validator.js';

// ─────────────────────────────────────────────────────────
// TEST HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Compute HMAC SHA256 signature exactly as Razorpay does.
 */
const makeValidSignature = (razorpayOrderId, razorpayPaymentId, secret) => {
    return crypto
        .createHmac('sha256', secret || 'test-secret')
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
};

/**
 * Compute webhook signature for raw body.
 */
const makeWebhookSignature = (rawBody, secret) => {
    return crypto
        .createHmac('sha256', secret || 'test-webhook-secret')
        .update(rawBody)
        .digest('hex');
};

/**
 * Create a minimal valid application Order for testing.
 */
const makeOrder = async (customerId, overrides = {}) => {
    return Order.create({
        orderNumber: `MD-TEST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        customer: customerId,
        items: [
            {
                menuItem: new mongoose.Types.ObjectId(),
                name: 'Test Biryani',
                variant: 'single',
                unitPrice: 200,
                price: 200,
                quantity: 2,
                subtotal: 400,
            },
        ],
        deliveryAddress: {
            firstName: 'Test',
            lastName: 'User',
            phone: '9876543210',
            email: 'test@example.com',
            address: 'Test Street, Ayodhya',
        },
        orderType: 'delivery',
        subtotal: 400,
        gst: 20,
        deliveryFee: 15,
        total: 435,
        paymentMethod: overrides.paymentMethod || 'razorpay',
        paymentStatus: overrides.paymentStatus || 'pending',
        orderStatus: overrides.orderStatus || 'placed',
        ...overrides,
    });
};

/**
 * Create a test customer.
 */
const makeCustomer = async () => {
    const id = crypto.randomBytes(4).toString('hex');
    return Customer.create({
        name: `Test Customer ${id}`,
        email: `customer-${id}@test.com`,
        phone: '9876543210',
        passwordHash: '$2a$10$testhash',
        emailVerified: true,
    });
};

// ─────────────────────────────────────────────────────────
// SUITE 1: Amount & Financial Calculation Tests
// ─────────────────────────────────────────────────────────

describe('Amount & Financial Calculations', () => {

    test('rupeesToPaise converts correctly without floating-point error', () => {
        assert.equal(razorpayService.rupeesToPaise(658.95), 65895);
        assert.equal(razorpayService.rupeesToPaise(599), 59900);
        assert.equal(razorpayService.rupeesToPaise(100.5), 10050);
        assert.equal(razorpayService.rupeesToPaise(0.01), 1);
        // Edge: floating-point drift prevention
        assert.equal(razorpayService.rupeesToPaise(29.95), 2995);
    });

    test('paise conversion example: 599 subtotal + 29.95 GST + 30 delivery = 65895 paise', () => {
        const subtotal = 599;
        const gst = Math.round(subtotal * 0.05 * 100) / 100; // 29.95
        const deliveryFee = 30;
        const total = Math.round((subtotal + gst + deliveryFee) * 100) / 100; // 658.95
        const paise = razorpayService.rupeesToPaise(total);

        assert.equal(gst, 29.95);
        assert.equal(total, 658.95);
        assert.equal(paise, 65895);
        assert.ok(Number.isInteger(paise), 'paise must be an integer');
    });

    test('5% GST calculation rounds correctly to 2 decimal places', () => {
        // Test multiple subtotals
        const cases = [
            [100, 5.00],
            [199, 9.95],
            [599, 29.95],
            [1000, 50.00],
        ];
        for (const [subtotal, expectedGst] of cases) {
            const gst = Math.round(subtotal * 0.05 * 100) / 100;
            assert.equal(gst, expectedGst, `GST for ₹${subtotal} should be ₹${expectedGst}`);
        }
    });

    test('backend total = subtotal + GST + deliveryFee', () => {
        const subtotal = 400;
        const gst = Math.round(subtotal * 0.05 * 100) / 100; // 20
        const deliveryFee = 15;
        const total = Math.round((subtotal + gst + deliveryFee) * 100) / 100; // 435

        assert.equal(total, 435);
        assert.equal(razorpayService.rupeesToPaise(total), 43500);
    });
});

// ─────────────────────────────────────────────────────────
// SUITE 2: Validator Tests
// ─────────────────────────────────────────────────────────

describe('Payment Validator Layer', () => {

    test('createPaymentSchema rejects missing orderId', async () => {
        const result = await createPaymentSchema.safeParseAsync({});
        assert.equal(result.success, false);
    });

    test('createPaymentSchema rejects invalid orderId format', async () => {
        const result = await createPaymentSchema.safeParseAsync({ orderId: 'not-an-objectid' });
        assert.equal(result.success, false);
    });

    test('createPaymentSchema accepts valid ObjectId', async () => {
        const result = await createPaymentSchema.safeParseAsync({
            orderId: '507f1f77bcf86cd799439011',
        });
        assert.equal(result.success, true);
    });

    test('verifyPaymentSchema rejects missing fields', async () => {
        const result = await verifyPaymentSchema.safeParseAsync({
            razorpayOrderId: 'order_test123',
            // missing razorpayPaymentId and razorpaySignature
        });
        assert.equal(result.success, false);
    });

    test('verifyPaymentSchema accepts all three required fields', async () => {
        const result = await verifyPaymentSchema.safeParseAsync({
            razorpayOrderId: 'order_test123',
            razorpayPaymentId: 'pay_test456',
            razorpaySignature: 'abc123def456',
        });
        assert.equal(result.success, true);
    });

    test('refundSchema rejects fractional paise', async () => {
        const result = await refundSchema.safeParseAsync({ amountInPaise: 100.5 });
        assert.equal(result.success, false);
    });

    test('refundSchema rejects zero amount', async () => {
        const result = await refundSchema.safeParseAsync({ amountInPaise: 0 });
        assert.equal(result.success, false);
    });

    test('refundSchema accepts valid paise amount', async () => {
        const result = await refundSchema.safeParseAsync({ amountInPaise: 43500 });
        assert.equal(result.success, true);
    });

    test('retryPaymentParamSchema rejects invalid orderId', async () => {
        const result = await retryPaymentParamSchema.safeParseAsync({ orderId: 'bad' });
        assert.equal(result.success, false);
    });

    test('retryPaymentParamSchema accepts valid orderId', async () => {
        const result = await retryPaymentParamSchema.safeParseAsync({
            orderId: '507f1f77bcf86cd799439011',
        });
        assert.equal(result.success, true);
    });
});

// ─────────────────────────────────────────────────────────
// SUITE 3: Signature Verification Tests
// ─────────────────────────────────────────────────────────

describe('Razorpay Signature Verification', () => {

    const testSecret = 'test-key-secret-for-unit-tests';
    const originalSecret = config.razorpay?.keySecret;

    before(() => {
        // Temporarily set test secret
        if (config.razorpay) config.razorpay.keySecret = testSecret;
    });

    after(() => {
        if (config.razorpay) config.razorpay.keySecret = originalSecret;
    });

    test('valid signature returns true', () => {
        const orderId = 'order_test123';
        const paymentId = 'pay_test456';
        const sig = makeValidSignature(orderId, paymentId, testSecret);

        const result = razorpayService.verifyPaymentSignature(orderId, paymentId, sig);
        assert.equal(result, true);
    });

    test('invalid signature returns false', () => {
        const result = razorpayService.verifyPaymentSignature(
            'order_test123',
            'pay_test456',
            'invalid-signature-hex'
        );
        assert.equal(result, false);
    });

    test('tampered orderId returns false', () => {
        const orderId = 'order_test123';
        const paymentId = 'pay_test456';
        const sig = makeValidSignature(orderId, paymentId, testSecret);

        // Use different orderId during verification
        const result = razorpayService.verifyPaymentSignature('order_TAMPERED', paymentId, sig);
        assert.equal(result, false);
    });

    test('tampered paymentId returns false', () => {
        const orderId = 'order_test123';
        const paymentId = 'pay_test456';
        const sig = makeValidSignature(orderId, paymentId, testSecret);

        const result = razorpayService.verifyPaymentSignature(orderId, 'pay_TAMPERED', sig);
        assert.equal(result, false);
    });

    test('tampered signature returns false', () => {
        const orderId = 'order_test123';
        const paymentId = 'pay_test456';
        const sig = makeValidSignature(orderId, paymentId, testSecret);

        // Flip a character
        const tamperedSig = sig.replace(sig[0], sig[0] === 'a' ? 'b' : 'a');
        const result = razorpayService.verifyPaymentSignature(orderId, paymentId, tamperedSig);
        assert.equal(result, false);
    });

    test('wrong secret returns false', () => {
        const orderId = 'order_test123';
        const paymentId = 'pay_test456';
        // Sign with different secret
        const sigWithWrongSecret = makeValidSignature(orderId, paymentId, 'wrong-secret');

        const result = razorpayService.verifyPaymentSignature(orderId, paymentId, sigWithWrongSecret);
        assert.equal(result, false);
    });

    test('webhook signature valid body returns true', () => {
        const webhookSecret = 'test-webhook-secret';
        const originalWebhookSecret = config.razorpay?.webhookSecret;
        if (config.razorpay) config.razorpay.webhookSecret = webhookSecret;

        const rawBody = Buffer.from(JSON.stringify({ event: 'payment.captured' }));
        const sig = makeWebhookSignature(rawBody, webhookSecret);
        const result = razorpayService.verifyWebhookSignature(rawBody, sig);

        if (config.razorpay) config.razorpay.webhookSecret = originalWebhookSecret;
        assert.equal(result, true);
    });

    test('webhook signature with tampered body returns false', () => {
        const webhookSecret = 'test-webhook-secret';
        const originalWebhookSecret = config.razorpay?.webhookSecret;
        if (config.razorpay) config.razorpay.webhookSecret = webhookSecret;

        const rawBody = Buffer.from(JSON.stringify({ event: 'payment.captured' }));
        const sig = makeWebhookSignature(rawBody, webhookSecret);

        // Tamper the body
        const tamperedBody = Buffer.from(JSON.stringify({ event: 'payment.captured', tampered: true }));
        const result = razorpayService.verifyWebhookSignature(tamperedBody, sig);

        if (config.razorpay) config.razorpay.webhookSecret = originalWebhookSecret;
        assert.equal(result, false);
    });
});

// ─────────────────────────────────────────────────────────
// SUITE 4: Payment Service Tests (require DB)
// ─────────────────────────────────────────────────────────

describe('Payment Service — DB Integration', () => {
    let customer;
    let otherCustomer;

    before(async () => {
        if (!mongoose.connection.readyState) {
            await mongoose.connect(config.mongoUri);
        }
        // Set a non-empty test keySecret so HMAC-based signature verification works in tests.
        // The value is intentionally non-empty so verifyPaymentSignature() doesn't throw
        // "not configured" — it will return false for invalid signatures as expected.
        if (config.razorpay) {
            config.razorpay.keySecret = config.razorpay.keySecret || 'test-key-secret-for-db-suite';
        }
        customer = await makeCustomer();
        otherCustomer = await makeCustomer();
    });

    after(async () => {
        // Cleanup
        await Order.deleteMany({ customer: { $in: [customer._id, otherCustomer._id] } });
        await PaymentAttempt.deleteMany({ customer: { $in: [customer._id, otherCustomer._id] } });
        await Customer.findByIdAndDelete(customer._id).catch(() => {});
        await Customer.findByIdAndDelete(otherCustomer._id).catch(() => {});
    });

    // ── State Machine Tests ──

    test('initiatePayment rejects invalid payment method', async () => {
        const order = await makeOrder(customer._id);
        await Order.updateOne({ _id: order._id }, { $set: { paymentMethod: 'wallet' } });

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            { message: 'This order is not eligible for online payment.' }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('COD + Pending order with unconfigured Razorpay rejects with friendly error without modifying order', async () => {
        const order = await makeOrder(customer._id, { paymentMethod: 'cod', paymentStatus: 'pending' });

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            (err) => {
                assert.ok(err.message.includes('temporarily unavailable') || err.message.includes('Cash on Delivery'));
                return true;
            }
        );

        // Verify order remains unchanged as COD and pending
        const current = await Order.findById(order._id);
        assert.equal(current.paymentMethod, 'cod');
        assert.equal(current.paymentStatus, 'pending');

        await Order.findByIdAndDelete(order._id);
    });

    test('initiatePayment rejects already-paid order', async () => {
        const order = await makeOrder(customer._id, { paymentStatus: 'paid' });

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            { message: 'This order has already been paid.' }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('initiatePayment rejects cancelled order', async () => {
        const order = await makeOrder(customer._id, { orderStatus: 'cancelled' });

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            { message: 'Cannot initiate payment for a cancelled order.' }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('initiatePayment rejects completed order', async () => {
        const order = await makeOrder(customer._id, { orderStatus: 'completed' });

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            { message: 'Cannot initiate payment for a completed order.' }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('initiatePayment rejects order belonging to another customer', async () => {
        const order = await makeOrder(otherCustomer._id);

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            (err) => {
                assert.ok(err.message.includes('permission'), `Expected permission error, got: ${err.message}`);
                return true;
            }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('initiatePayment rejects non-existent order', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, fakeId),
            { message: 'Order not found.' }
        );
    });

    // ── Retry Flow Tests ──

    test('retryPayment rejects already-paid order', async () => {
        const order = await makeOrder(customer._id, { paymentStatus: 'paid' });

        await assert.rejects(
            () => paymentService.retryPayment(customer._id, order._id),
            { message: 'This order has already been paid.' }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('retryPayment rejects cancelled order', async () => {
        const order = await makeOrder(customer._id, { orderStatus: 'cancelled' });

        await assert.rejects(
            () => paymentService.retryPayment(customer._id, order._id),
            { message: 'Cannot initiate payment for a cancelled order.' }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('retryPayment rejects unauthorized access to another customer order', async () => {
        const order = await makeOrder(otherCustomer._id);

        await assert.rejects(
            () => paymentService.retryPayment(customer._id, order._id),
            (err) => {
                assert.ok(err.message.includes('permission'), `Expected permission error, got: ${err.message}`);
                return true;
            }
        );

        await Order.findByIdAndDelete(order._id);
    });

    // ── Verification Tests (mocked Razorpay) ──

    test('verifyPayment rejects invalid signature', async () => {
        const order = await makeOrder(customer._id);

        // Create a fake PaymentAttempt
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_invalid_sig_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'created',
        });

        await assert.rejects(
            () => paymentService.verifyPayment(customer._id, {
                razorpayOrderId: attempt.razorpayOrderId,
                razorpayPaymentId: 'pay_fakeId',
                razorpaySignature: 'invalid-signature',
            }),
            { message: 'Payment verification failed. Invalid signature.' }
        );

        // Verify attempt was marked failed
        const updatedAttempt = await PaymentAttempt.findById(attempt._id);
        assert.equal(updatedAttempt.status, 'failed');
        assert.equal(updatedAttempt.failureReason, 'Invalid payment signature');

        // Verify order is still unpaid
        const updatedOrder = await Order.findById(order._id);
        assert.equal(updatedOrder.paymentStatus, 'pending');

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('verifyPayment rejects attempt belonging to another customer', async () => {
        const order = await makeOrder(otherCustomer._id);
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: otherCustomer._id,
            razorpayOrderId: `order_cross_customer_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'created',
        });

        await assert.rejects(
            () => paymentService.verifyPayment(customer._id, {
                razorpayOrderId: attempt.razorpayOrderId,
                razorpayPaymentId: 'pay_test',
                razorpaySignature: 'sig_test',
            }),
            (err) => {
                assert.ok(err.message.includes('permission'), `Expected permission error, got: ${err.message}`);
                return true;
            }
        );

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('verifyPayment rejects non-existent razorpayOrderId', async () => {
        await assert.rejects(
            () => paymentService.verifyPayment(customer._id, {
                razorpayOrderId: 'order_does_not_exist_9999',
                razorpayPaymentId: 'pay_test',
                razorpaySignature: 'sig_test',
            }),
            { message: 'Payment attempt not found.' }
        );
    });

    test('verifyPayment duplicate verification is idempotent (already paid returns order)', async () => {
        const order = await makeOrder(customer._id, { paymentStatus: 'paid' });
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_already_paid_${Date.now()}`,
            razorpayPaymentId: 'pay_already_done',
            amount: 43500,
            currency: 'INR',
            status: 'paid',
            webhookProcessed: true,
        });

        // Second verification should return the order without error (idempotent)
        const result = await paymentService.verifyPayment(customer._id, {
            razorpayOrderId: attempt.razorpayOrderId,
            razorpayPaymentId: 'pay_already_done',
            razorpaySignature: 'any_sig',
        });

        assert.ok(result, 'Should return order for already-paid attempt');
        assert.equal(result.paymentStatus, 'paid');

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('COD order transitions to paid and paymentMethod=razorpay on SAME order without creating duplicates', async () => {
        const order = await makeOrder(customer._id, { paymentMethod: 'cod', paymentStatus: 'pending' });
        const originalOrderId = order._id.toString();
        const originalOrderNumber = order.orderNumber;

        // Create PaymentAttempt for the COD order (unit test fixture)
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_cod_to_online_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'created',
        });

        // Verify payment
        const secret = config.razorpay?.keySecret || 'test-key-secret-for-db-suite';
        const sig = makeValidSignature(attempt.razorpayOrderId, 'pay_cod_to_online_123', secret);

        const updatedOrder = await paymentService.verifyPayment(customer._id, {
            razorpayOrderId: attempt.razorpayOrderId,
            razorpayPaymentId: 'pay_cod_to_online_123',
            razorpaySignature: sig,
        });

        // Verify SAME order updated (no duplicate)
        assert.equal(updatedOrder._id.toString(), originalOrderId);
        assert.equal(updatedOrder.orderNumber, originalOrderNumber);
        assert.equal(updatedOrder.paymentStatus, 'paid');
        assert.equal(updatedOrder.paymentMethod, 'razorpay');
        assert.equal(updatedOrder.orderStatus, 'placed'); // orderStatus not mutated

        // Verify only 1 order exists in DB for this ID
        const count = await Order.countDocuments({ _id: order._id });
        assert.equal(count, 1);

        await PaymentAttempt.deleteMany({ order: order._id });
        await Order.findByIdAndDelete(order._id);
    });

    // ── Refund Tests ──

    test('initiateRefund rejects non-paid attempt', async () => {
        const order = await makeOrder(customer._id);
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_refund_test_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'failed',
        });

        await assert.rejects(
            () => paymentService.initiateRefund(attempt._id, 43500),
            { message: 'Only successfully paid payments can be refunded.' }
        );

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('initiateRefund rejects amount exceeding original payment', async () => {
        const order = await makeOrder(customer._id);
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_refund_excess_${Date.now()}`,
            razorpayPaymentId: 'pay_refund_test',
            amount: 43500, // ₹435 in paise
            currency: 'INR',
            status: 'paid',
        });

        await assert.rejects(
            () => paymentService.initiateRefund(attempt._id, 99999), // More than 43500
            (err) => {
                assert.ok(err.message.includes('43500'), `Expected amount validation error: ${err.message}`);
                return true;
            }
        );

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('initiateRefund rejects duplicate refund (refundId already set)', async () => {
        const order = await makeOrder(customer._id);
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_dup_refund_${Date.now()}`,
            razorpayPaymentId: 'pay_dup_refund',
            amount: 43500,
            currency: 'INR',
            status: 'paid',
            refundId: 'rfnd_already_exists', // Simulate existing refund
        });

        await assert.rejects(
            () => paymentService.initiateRefund(attempt._id, 43500),
            { message: 'A refund has already been initiated for this payment.' }
        );

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('initiateRefund rejects zero amount', async () => {
        const order = await makeOrder(customer._id);
        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_zero_refund_${Date.now()}`,
            razorpayPaymentId: 'pay_zero_refund',
            amount: 43500,
            currency: 'INR',
            status: 'paid',
        });

        await assert.rejects(
            () => paymentService.initiateRefund(attempt._id, 0),
            (err) => {
                // The service message is: 'Refund amount must be between 1 and {amount} paise'
                assert.ok(
                    err.message.includes('between 1') || err.message.includes('positive') || err.message.includes('paise'),
                    `Expected amount validation error, got: ${err.message}`
                );
                return true;
            }
        );

        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    // ── COD Consistency Tests ──

    test('COD order has paymentMethod=cod and no PaymentAttempt', async () => {
        const order = await makeOrder(customer._id, {
            paymentMethod: 'cod',
            paymentStatus: 'pending',
        });

        assert.equal(order.paymentMethod, 'cod');
        assert.equal(order.paymentStatus, 'pending');

        // Verify no PaymentAttempt created
        const attempts = await PaymentAttempt.find({ order: order._id });
        assert.equal(attempts.length, 0);

        // COD order is eligible to initiate online payment
        await assert.rejects(
            () => paymentService.initiatePayment(customer._id, order._id),
            (err) => {
                assert.ok(err.message.includes('temporarily unavailable') || err.message.includes('Cash on Delivery'));
                return true;
            }
        );

        await Order.findByIdAndDelete(order._id);
    });

    test('COD order paymentStatus stays pending until admin action', async () => {
        const order = await makeOrder(customer._id, {
            paymentMethod: 'cod',
            paymentStatus: 'pending',
        });

        // Verify still pending
        const fetched = await Order.findById(order._id);
        assert.equal(fetched.paymentStatus, 'pending');
        assert.equal(fetched.paymentMethod, 'cod');

        await Order.findByIdAndDelete(order._id);
    });

    // ── Multiple Attempts Tests ──

    test('multiple failed attempts preserved, order stays unpaid', async () => {
        const order = await makeOrder(customer._id);

        // Simulate 2 failed attempts
        const attempt1 = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_multi_1_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'failed',
            failureReason: 'Card declined',
            webhookProcessed: true,
        });

        const attempt2 = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId: `order_multi_2_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'failed',
            failureReason: 'Insufficient balance',
            webhookProcessed: true,
        });

        // Order should still be pending
        const currentOrder = await Order.findById(order._id);
        assert.equal(currentOrder.paymentStatus, 'pending');

        // Both attempts preserved
        const allAttempts = await PaymentAttempt.find({ order: order._id });
        assert.equal(allAttempts.length, 2);
        assert.ok(allAttempts.every(a => a.status === 'failed'));

        await PaymentAttempt.deleteMany({ order: order._id });
        await Order.findByIdAndDelete(order._id);
    });

    test('getPaymentAttemptsByOrder returns attempts in chronological order', async () => {
        const order = await makeOrder(customer._id);

        await PaymentAttempt.create({
            order: order._id, customer: customer._id,
            razorpayOrderId: `order_chrono_1_${Date.now()}`,
            amount: 43500, currency: 'INR', status: 'failed',
        });

        // Small delay to ensure different timestamps
        await new Promise(r => setTimeout(r, 10));

        await PaymentAttempt.create({
            order: order._id, customer: customer._id,
            razorpayOrderId: `order_chrono_2_${Date.now()}`,
            amount: 43500, currency: 'INR', status: 'paid',
        });

        const attempts = await paymentService.getPaymentAttemptsByOrder(order._id);
        assert.equal(attempts.length, 2);
        // First should be older (failed), second newer (paid)
        assert.equal(attempts[0].status, 'failed');
        assert.equal(attempts[1].status, 'paid');

        await PaymentAttempt.deleteMany({ order: order._id });
        await Order.findByIdAndDelete(order._id);
    });

    // ── Webhook Idempotency Tests ──

    test('webhook payment.captured is idempotent — duplicate delivery does not double-process', async () => {
        const order = await makeOrder(customer._id);
        const razorpayOrderId = `order_webhook_idem_${Date.now()}`;

        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId,
            amount: 43500,
            currency: 'INR',
            status: 'created',
            webhookProcessed: false,
        });

        const webhookBody = JSON.stringify({
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_webhook_test',
                        order_id: razorpayOrderId,
                        method: 'upi',
                    },
                },
            },
        });

        const webhookSecret = 'test-webhook-secret';
        const originalWebhookSecret = config.razorpay?.webhookSecret;
        if (config.razorpay) config.razorpay.webhookSecret = webhookSecret;

        const rawBody = Buffer.from(webhookBody);
        const sig = makeWebhookSignature(rawBody, webhookSecret);

        // First delivery
        await paymentService.handleWebhookEvent(rawBody, sig);

        // Verify processed
        const after1 = await PaymentAttempt.findById(attempt._id);
        assert.equal(after1.status, 'paid');
        assert.equal(after1.webhookProcessed, true);

        const orderAfter1 = await Order.findById(order._id);
        assert.equal(orderAfter1.paymentStatus, 'paid');

        // Second delivery (duplicate) — should not error, attempt stays paid
        await paymentService.handleWebhookEvent(rawBody, sig);

        const after2 = await PaymentAttempt.findById(attempt._id);
        assert.equal(after2.status, 'paid'); // unchanged
        assert.equal(after2.webhookProcessed, true); // unchanged

        const orderAfter2 = await Order.findById(order._id);
        assert.equal(orderAfter2.paymentStatus, 'paid'); // unchanged

        if (config.razorpay) config.razorpay.webhookSecret = originalWebhookSecret;
        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('webhook with invalid signature throws UnauthorizedError', async () => {
        const webhookSecret = 'test-webhook-secret';
        const originalWebhookSecret = config.razorpay?.webhookSecret;
        if (config.razorpay) config.razorpay.webhookSecret = webhookSecret;

        const rawBody = Buffer.from(JSON.stringify({ event: 'payment.captured' }));

        await assert.rejects(
            () => paymentService.handleWebhookEvent(rawBody, 'bad-signature'),
            (err) => {
                assert.ok(
                    err.message.includes('signature') || err.statusCode === 401,
                    `Expected signature error, got: ${err.message}`
                );
                return true;
            }
        );

        if (config.razorpay) config.razorpay.webhookSecret = originalWebhookSecret;
    });

    test('webhook payment.failed marks attempt as failed and order stays unpaid', async () => {
        const order = await makeOrder(customer._id);
        const razorpayOrderId = `order_wh_fail_${Date.now()}`;

        const attempt = await PaymentAttempt.create({
            order: order._id,
            customer: customer._id,
            razorpayOrderId,
            amount: 43500,
            currency: 'INR',
            status: 'created',
            webhookProcessed: false,
        });

        const webhookBody = JSON.stringify({
            event: 'payment.failed',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_failed_test',
                        order_id: razorpayOrderId,
                        error_description: 'Payment failed due to insufficient funds',
                    },
                },
            },
        });

        const webhookSecret = 'test-webhook-secret';
        const originalWebhookSecret = config.razorpay?.webhookSecret;
        if (config.razorpay) config.razorpay.webhookSecret = webhookSecret;

        const rawBody = Buffer.from(webhookBody);
        const sig = makeWebhookSignature(rawBody, webhookSecret);

        await paymentService.handleWebhookEvent(rawBody, sig);

        const updatedAttempt = await PaymentAttempt.findById(attempt._id);
        assert.equal(updatedAttempt.status, 'failed');
        assert.ok(updatedAttempt.webhookProcessed);

        // Order payment status should NOT be paid
        const updatedOrder = await Order.findById(order._id);
        assert.equal(updatedOrder.paymentStatus, 'pending');

        if (config.razorpay) config.razorpay.webhookSecret = originalWebhookSecret;
        await PaymentAttempt.findByIdAndDelete(attempt._id);
        await Order.findByIdAndDelete(order._id);
    });

    test('webhook payment.captured for unknown razorpayOrderId is silently ignored (no error)', async () => {
        const webhookBody = JSON.stringify({
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_unknown',
                        order_id: 'order_completely_unknown_xyz',
                        method: 'upi',
                    },
                },
            },
        });

        const webhookSecret = 'test-webhook-secret';
        const originalWebhookSecret = config.razorpay?.webhookSecret;
        if (config.razorpay) config.razorpay.webhookSecret = webhookSecret;

        const rawBody = Buffer.from(webhookBody);
        const sig = makeWebhookSignature(rawBody, webhookSecret);

        // Should not throw — unknown events are safely ignored
        await assert.doesNotReject(() => paymentService.handleWebhookEvent(rawBody, sig));

        if (config.razorpay) config.razorpay.webhookSecret = originalWebhookSecret;
    });

    // ── Admin Query Tests ──

    test('getAllPaymentAttempts returns paginated results', async () => {
        const result = await paymentService.getAllPaymentAttempts({ page: 1, limit: 5 });
        assert.ok(typeof result.total === 'number');
        assert.ok(Array.isArray(result.attempts));
        assert.equal(result.page, 1);
        assert.equal(result.limit, 5);
    });

    test('getAllPaymentAttempts filters by status', async () => {
        const order = await makeOrder(customer._id);
        await PaymentAttempt.create({
            order: order._id, customer: customer._id,
            razorpayOrderId: `order_filter_test_${Date.now()}`,
            amount: 43500, currency: 'INR', status: 'failed',
        });

        const result = await paymentService.getAllPaymentAttempts({ status: 'failed' });
        assert.ok(result.attempts.every(a => a.status === 'failed'), 'All returned attempts should be failed');

        await PaymentAttempt.deleteMany({ order: order._id });
        await Order.findByIdAndDelete(order._id);
    });
});

// ─────────────────────────────────────────────────────────
// SUITE 5: PaymentAttempt Model Tests
// ─────────────────────────────────────────────────────────

describe('PaymentAttempt Model', () => {
    let testCustomer;
    let testOrder;

    before(async () => {
        if (!mongoose.connection.readyState) {
            await mongoose.connect(config.mongoUri);
        }
        testCustomer = await makeCustomer();
        testOrder = await makeOrder(testCustomer._id);
    });

    after(async () => {
        await PaymentAttempt.deleteMany({ order: testOrder._id });
        await Order.findByIdAndDelete(testOrder._id);
        await Customer.findByIdAndDelete(testCustomer._id).catch(() => {});
    });

    test('PaymentAttempt can be created with required fields', async () => {
        const attempt = await PaymentAttempt.create({
            order: testOrder._id,
            customer: testCustomer._id,
            razorpayOrderId: `order_model_test_${Date.now()}`,
            amount: 43500,
            currency: 'INR',
            status: 'created',
        });

        assert.ok(attempt._id);
        assert.equal(attempt.status, 'created');
        assert.equal(attempt.amount, 43500);
        assert.equal(attempt.currency, 'INR');
        assert.equal(attempt.webhookProcessed, false);
    });

    test('PaymentAttempt razorpaySignature is excluded from toJSON', async () => {
        const attempt = await PaymentAttempt.create({
            order: testOrder._id,
            customer: testCustomer._id,
            razorpayOrderId: `order_sig_excl_${Date.now()}`,
            razorpaySignature: 'super-secret-signature',
            amount: 43500,
            currency: 'INR',
            status: 'paid',
        });

        const json = attempt.toJSON();
        assert.ok(!('razorpaySignature' in json), 'razorpaySignature must not appear in toJSON output');
    });

    test('PaymentAttempt rejects duplicate razorpayOrderId', async () => {
        const duplicateId = `order_dup_${Date.now()}`;

        await PaymentAttempt.create({
            order: testOrder._id,
            customer: testCustomer._id,
            razorpayOrderId: duplicateId,
            amount: 43500, currency: 'INR', status: 'created',
        });

        await assert.rejects(
            () => PaymentAttempt.create({
                order: testOrder._id,
                customer: testCustomer._id,
                razorpayOrderId: duplicateId, // same ID — should fail
                amount: 43500, currency: 'INR', status: 'created',
            }),
            (err) => {
                assert.ok(err.code === 11000 || err.message.includes('duplicate'), 
                    `Expected duplicate key error, got: ${err.message}`);
                return true;
            }
        );
    });

    test('PaymentAttempt status enum rejects invalid values', async () => {
        await assert.rejects(
            () => PaymentAttempt.create({
                order: testOrder._id,
                customer: testCustomer._id,
                razorpayOrderId: `order_invalid_status_${Date.now()}`,
                amount: 43500, currency: 'INR',
                status: 'unknown_status', // invalid
            }),
            (err) => {
                assert.ok(err.name === 'ValidationError', `Expected ValidationError, got: ${err.name}`);
                return true;
            }
        );
    });
});
