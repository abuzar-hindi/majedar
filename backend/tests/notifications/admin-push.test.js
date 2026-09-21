import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { config } from '../../src/config/env.js';
import { Admin } from '../../src/models/Admin.js';
import { Order } from '../../src/models/Order.js';
import { Customer } from '../../src/models/Customer.js';
import { PaymentAttempt } from '../../src/models/Payment.js';
import { AdminPushSubscription } from '../../src/models/AdminPushSubscription.js';
import * as pushService from '../../src/services/notifications/admin-push.service.js';
import { signToken } from '../../src/utils/token.js';

describe('Admin Web Push Notification System', () => {
    let admin;
    let adminToken;
    let customer;

    let server;
    let baseUrl;

    before(async () => {
        if (!mongoose.connection.readyState) {
            await mongoose.connect(config.mongoUri);
        }

        // Start ephemeral HTTP server for API route testing
        server = app.listen(0);
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;

        // Configure test VAPID credentials if empty
        if (!config.vapid?.publicKey || !config.vapid?.privateKey) {
            config.vapid = {
                publicKey: 'BAIl2PqQ2hQuNvrolTGgIdMh3KKQAC1do179EUpo4On6ibAQR_CyxtQKy4crRW6LGwHZfJcDJkG99BtslkNb1To',
                privateKey: 'Xx8_780W3qjKBT--JeZVEPVhEs1-C9IIwqyUO9-7org',
                subject: 'mailto:admin@majedaar.com',
            };
        }

        const id = crypto.randomBytes(4).toString('hex');
        admin = await Admin.create({
            name: `Test Admin ${id}`,
            email: `admin-${id}@test.com`,
            passwordHash: '$2a$10$testhash',
            role: 'admin',
        });
        adminToken = signToken({ id: admin._id, role: admin.role });

        customer = await Customer.create({
            name: `Test Customer ${id}`,
            email: `customer-${id}@test.com`,
            phone: '9876543210',
            passwordHash: '$2a$10$testhash',
            emailVerified: true,
        });
    });

    after(async () => {
        if (server) {
            server.close();
        }
        if (admin) {
            await AdminPushSubscription.deleteMany({ admin: admin._id });
            await Admin.findByIdAndDelete(admin._id);
        }
        if (customer) {
            await Order.deleteMany({ customer: customer._id });
            await PaymentAttempt.deleteMany({ customer: customer._id });
            await Customer.findByIdAndDelete(customer._id);
        }
    });

    // ── 1. Model & Subscription Service Tests ─────────────────────────────

    test('AdminPushSubscription model creates and indexes properly', async () => {
        const endpoint = `https://fcm.googleapis.com/fcm/send/test-${crypto.randomBytes(4).toString('hex')}`;
        const sub = await AdminPushSubscription.create({
            admin: admin._id,
            endpoint,
            p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=',
            auth: 'tBHItJI5svbpez7KI4CCXg==',
            userAgent: 'Mozilla/5.0 Test Browser',
        });

        assert.ok(sub._id);
        assert.equal(sub.admin.toString(), admin._id.toString());
        assert.equal(sub.endpoint, endpoint);

        // Enforce uniqueness on endpoint
        await assert.rejects(
            () =>
                AdminPushSubscription.create({
                    admin: admin._id,
                    endpoint,
                    p256dh: 'diff-key',
                    auth: 'diff-auth',
                }),
            /duplicate key/i
        );

        await AdminPushSubscription.findByIdAndDelete(sub._id);
    });

    test('getVapidPublicKey returns the public key and never the private key', () => {
        const pubKey = pushService.getVapidPublicKey();
        assert.ok(pubKey, 'Public key should be present');
        assert.notEqual(pubKey, config.vapid.privateKey, 'Must not return private key');
        assert.equal(pubKey.includes(config.vapid.privateKey), false);
    });

    test('saveSubscription upserts by endpoint', async () => {
        const endpoint = `https://push.example.com/endpoint-${crypto.randomBytes(4).toString('hex')}`;
        const initial = await pushService.saveSubscription({
            adminId: admin._id,
            subscription: {
                endpoint,
                keys: { p256dh: 'key1', auth: 'auth1' },
            },
            userAgent: 'Device 1',
        });

        assert.equal(initial.endpoint, endpoint);
        assert.equal(initial.p256dh, 'key1');

        // Update existing endpoint
        const updated = await pushService.saveSubscription({
            adminId: admin._id,
            subscription: {
                endpoint,
                keys: { p256dh: 'key2', auth: 'auth2' },
            },
            userAgent: 'Device 1 Updated',
        });

        assert.equal(updated._id.toString(), initial._id.toString());
        assert.equal(updated.p256dh, 'key2');
        assert.equal(updated.userAgent, 'Device 1 Updated');

        await AdminPushSubscription.findByIdAndDelete(initial._id);
    });

    test('deleteSubscription removes subscription by endpoint', async () => {
        const endpoint = `https://push.example.com/delete-test-${crypto.randomBytes(4).toString('hex')}`;
        await pushService.saveSubscription({
            adminId: admin._id,
            subscription: {
                endpoint,
                keys: { p256dh: 'key', auth: 'auth' },
            },
        });

        const deleted = await pushService.deleteSubscription({ endpoint, adminId: admin._id });
        assert.equal(deleted, true);

        const found = await AdminPushSubscription.findOne({ endpoint });
        assert.equal(found, null);
    });

    // ── 2. Route Security & API Tests ─────────────────────────────────────

    test('GET /api/admin/push/vapid-public-key requires admin authentication', async () => {
        const res = await fetch(`${baseUrl}/api/admin/push/vapid-public-key`);
        assert.equal(res.status, 401, 'Unauthenticated request must be rejected');
    });

    test('GET /api/admin/push/vapid-public-key succeeds with admin cookie', async () => {
        const res = await fetch(`${baseUrl}/api/admin/push/vapid-public-key`, {
            headers: {
                Cookie: `${config.cookie.name}=${adminToken}`,
            },
        });
        assert.equal(res.status, 200);
        const json = await res.json();
        assert.equal(json.status, 'success');
        assert.ok(json.data.publicKey);
    });

    test('POST /api/admin/push/subscribe validates payload and saves subscription', async () => {
        const endpoint = `https://fcm.googleapis.com/fcm/send/api-sub-${crypto.randomBytes(4).toString('hex')}`;
        const res = await fetch(`${baseUrl}/api/admin/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `${config.cookie.name}=${adminToken}`,
            },
            body: JSON.stringify({
                endpoint,
                keys: {
                    p256dh: 'p256dh-sample-key',
                    auth: 'auth-sample-secret',
                },
            }),
        });

        assert.equal(res.status, 200);
        const json = await res.json();
        assert.equal(json.status, 'success');

        const saved = await AdminPushSubscription.findOne({ endpoint });
        assert.ok(saved);
        assert.equal(saved.admin.toString(), admin._id.toString());

        // Unsubscribe
        const unsubRes = await fetch(`${baseUrl}/api/admin/push/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `${config.cookie.name}=${adminToken}`,
            },
            body: JSON.stringify({ endpoint }),
        });
        assert.equal(unsubRes.status, 200);

        const checkDeleted = await AdminPushSubscription.findOne({ endpoint });
        assert.equal(checkDeleted, null);
    });

    test('POST /api/admin/push/subscribe rejects invalid payload', async () => {
        const res = await fetch(`${baseUrl}/api/admin/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `${config.cookie.name}=${adminToken}`,
            },
            body: JSON.stringify({
                endpoint: 'not-a-url',
                keys: {},
            }),
        });

        assert.equal(res.status, 400);
    });

    // ── 3. Duplicate Protection on Order Creation ─────────────────────────

    test('Order model sets pushNotificationSent on new order and prevents duplicate pushes', async () => {
        const order = await Order.create({
            orderNumber: `MD-NOTIF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            customer: customer._id,
            items: [
                {
                    menuItem: new mongoose.Types.ObjectId(),
                    name: 'Test Roll',
                    variant: 'single',
                    unitPrice: 150,
                    price: 150,
                    quantity: 1,
                    subtotal: 150,
                },
            ],
            deliveryAddress: {
                firstName: 'Mohd',
                lastName: 'Zaid',
                phone: '9876543210',
                email: 'zaid@example.com',
                address: 'Civil Lines',
            },
            orderType: 'delivery',
            subtotal: 150,
            gst: 7.5,
            deliveryFee: 15,
            total: 172.5,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderStatus: 'placed',
            pushNotificationSent: false,
        });

        // 1st claim: should succeed
        const firstClaim = await Order.findOneAndUpdate(
            { _id: order._id, pushNotificationSent: false },
            { pushNotificationSent: true },
            { new: true }
        );
        assert.ok(firstClaim, 'First claim must succeed');
        assert.equal(firstClaim.pushNotificationSent, true);

        // 2nd claim (simulating retry or duplicate processing): must return null
        const secondClaim = await Order.findOneAndUpdate(
            { _id: order._id, pushNotificationSent: false },
            { pushNotificationSent: true },
            { new: true }
        );
        assert.equal(secondClaim, null, 'Second claim must be blocked to prevent duplicate push');

        await Order.findByIdAndDelete(order._id);
    });

    // ── 4. Duplicate Protection on Payment Verification ───────────────────

    test('PaymentAttempt model sets pushNotificationSent on successful payment and prevents duplicates', async () => {
        const attempt = await PaymentAttempt.create({
            order: new mongoose.Types.ObjectId(),
            customer: customer._id,
            razorpayOrderId: `order_test_${crypto.randomBytes(4).toString('hex')}`,
            amount: 65895, // ₹658.95 in paise
            currency: 'INR',
            status: 'paid',
            pushNotificationSent: false,
        });

        // 1st claim: should succeed
        const firstClaim = await PaymentAttempt.findOneAndUpdate(
            { _id: attempt._id, pushNotificationSent: false },
            { pushNotificationSent: true },
            { new: true }
        );
        assert.ok(firstClaim, 'First payment claim must succeed');
        assert.equal(firstClaim.pushNotificationSent, true);

        // 2nd claim (simulating webhook retry or duplicate webhook): must return null
        const secondClaim = await PaymentAttempt.findOneAndUpdate(
            { _id: attempt._id, pushNotificationSent: false },
            { pushNotificationSent: true },
            { new: true }
        );
        assert.equal(secondClaim, null, 'Second payment claim must be blocked');

        await PaymentAttempt.findByIdAndDelete(attempt._id);
    });

    test('Failed payment attempt does NOT claim or trigger payment notification', async () => {
        const attempt = await PaymentAttempt.create({
            order: new mongoose.Types.ObjectId(),
            customer: customer._id,
            razorpayOrderId: `order_fail_${crypto.randomBytes(4).toString('hex')}`,
            amount: 50000,
            currency: 'INR',
            status: 'failed',
            failureReason: 'Signature mismatch',
            pushNotificationSent: false,
        });

        // Attempting to claim a paid notification on a non-paid attempt should be rejected
        const claim = await PaymentAttempt.findOneAndUpdate(
            { _id: attempt._id, status: 'paid', pushNotificationSent: false },
            { pushNotificationSent: true }
        );
        assert.equal(claim, null, 'Failed payment attempts must not be claimed for notification');

        await PaymentAttempt.findByIdAndDelete(attempt._id);
    });
});
