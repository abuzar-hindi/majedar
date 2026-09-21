import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Admin } from '../../src/models/Admin.js';
import { Order } from '../../src/models/Order.js';
import { DeliveryZone } from '../../src/models/DeliveryZone.js';
import { PaymentAttempt } from '../../src/models/Payment.js';
import { Review } from '../../src/models/Review.js';
import { Message } from '../../src/models/Message.js';
import { signToken } from '../../src/utils/token.js';
import { config } from '../../src/config/env.js';

describe('Admin API Route Regression & Security Test Suite', () => {
    let server;
    let baseUrl;
    let adminToken;
    let customerToken;

    const sampleAdminId = new mongoose.Types.ObjectId();
    const sampleCustomerId = new mongoose.Types.ObjectId();

    // Preserve original model methods
    const origAdminFindById = Admin.findById;
    const origOrderFind = Order.find;
    const origDeliveryZoneFind = DeliveryZone.find;
    const origDeliveryZoneFindOne = DeliveryZone.findOne;
    const origDeliveryZoneSave = DeliveryZone.prototype.save;
    const origPaymentFind = PaymentAttempt.find;
    const origPaymentCount = PaymentAttempt.countDocuments;
    const origReviewFind = Review.find;
    const origReviewCount = Review.countDocuments;
    const origMessageFind = Message.find;

    const createChain = (data = []) => {
        const chain = {
            populate: () => chain,
            sort: () => chain,
            skip: () => chain,
            limit: () => chain,
            select: () => chain,
            lean: () => chain,
            then: (resolve, reject) => Promise.resolve(data).then(resolve, reject),
            catch: (reject) => Promise.resolve(data).catch(reject),
        };
        return chain;
    };

    before(async () => {
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;

        adminToken = signToken({ id: sampleAdminId.toString(), role: 'admin' }, '1h');
        customerToken = signToken({ id: sampleCustomerId.toString(), type: 'customer', tokenVersion: 0 }, '1h');

        // Admin authentication mock
        Admin.findById = async (id) => {
            if (id && id.toString() === sampleAdminId.toString()) {
                return {
                    _id: sampleAdminId,
                    name: 'Admin User',
                    email: 'admin@majedaar.com',
                    role: 'admin',
                    isActive: true,
                };
            }
            return null;
        };

        // Model query chain mocks
        Order.find = () => createChain([
            {
                _id: new mongoose.Types.ObjectId(),
                orderNumber: 'ORD-1001',
                total: 250,
                orderStatus: 'placed',
                paymentStatus: 'pending',
                items: [],
            },
        ]);

        DeliveryZone.find = () => createChain([
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Ram Path',
                type: '0-3km',
                deliveryFee: 15,
                isActive: true,
            },
        ]);

        DeliveryZone.findOne = async () => null; // No duplicate on create

        DeliveryZone.prototype.save = async function () {
            this._id = new mongoose.Types.ObjectId();
            return this;
        };

        PaymentAttempt.find = () => createChain([
            {
                _id: new mongoose.Types.ObjectId(),
                attemptNumber: 1,
                amount: 250,
                status: 'captured',
            },
        ]);
        PaymentAttempt.countDocuments = async () => 1;

        Review.find = () => createChain([
            {
                _id: new mongoose.Types.ObjectId(),
                rating: 5,
                comment: 'Delicious food!',
            },
        ]);
        Review.countDocuments = async () => 1;

        Message.find = () => createChain([
            {
                _id: new mongoose.Types.ObjectId(),
                type: 'feedback',
                message: 'Great service',
                status: 'new',
            },
        ]);
    });

    after(async () => {
        Admin.findById = origAdminFindById;
        Order.find = origOrderFind;
        DeliveryZone.find = origDeliveryZoneFind;
        DeliveryZone.findOne = origDeliveryZoneFindOne;
        DeliveryZone.prototype.save = origDeliveryZoneSave;
        PaymentAttempt.find = origPaymentFind;
        PaymentAttempt.countDocuments = origPaymentCount;
        Review.find = origReviewFind;
        Review.countDocuments = origReviewCount;
        Message.find = origMessageFind;

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    // =========================================================================
    // 1. Unauthenticated Access Rejection (Security Regression)
    // =========================================================================
    describe('1. Unauthenticated requests are rejected (401 Unauthorized)', () => {
        const endpoints = [
            { method: 'GET', path: '/api/admin/orders' },
            { method: 'GET', path: '/api/admin/delivery-zones' },
            { method: 'GET', path: '/api/admin/payments?page=1&limit=50' },
            { method: 'GET', path: '/api/admin/reviews' },
            { method: 'GET', path: '/api/admin/messages' },
            {
                method: 'POST',
                path: '/api/admin/delivery-zones',
                body: { name: 'Test', type: '0-3km', deliveryFee: 15 },
            },
        ];

        for (const ep of endpoints) {
            test(`${ep.method} ${ep.path} returns 401 without auth cookie`, async () => {
                const res = await fetch(`${baseUrl}${ep.path}`, {
                    method: ep.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: ep.body ? JSON.stringify(ep.body) : undefined,
                });
                assert.equal(res.status, 401);
                const data = await res.json();
                assert.equal(data.success, false);
            });
        }
    });

    // =========================================================================
    // 2. Customer Token Cannot Access Admin Endpoints
    // =========================================================================
    describe('2. Customer tokens cannot access Admin endpoints (401/403 Rejected)', () => {
        test('GET /api/admin/orders rejected with customer cookie', async () => {
            const res = await fetch(`${baseUrl}/api/admin/orders`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.customerCookie.name}=${customerToken}`,
                },
            });
            assert.equal(res.status, 401);
        });

        test('GET /api/admin/delivery-zones rejected with customer token in admin cookie name', async () => {
            const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.cookie.name}=${customerToken}`,
                },
            });
            assert.equal(res.status, 401);
        });
    });

    // =========================================================================
    // 3. Authenticated Admin Requests Succeeded (Route Restoration Verification)
    // =========================================================================
    describe('3. Six reported broken Admin endpoints return 200/201 for Admin', () => {
        test('GET /api/admin/orders returns 200 and orders payload', async () => {
            const res = await fetch(`${baseUrl}/api/admin/orders`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
            });
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(body.data !== undefined);
        });

        test('GET /api/admin/delivery-zones returns 200 and zones payload', async () => {
            const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
            });
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(Array.isArray(body.data.zones));
            assert.equal(body.data.zones[0].name, 'Ram Path');
        });

        test('GET /api/admin/payments?page=1&limit=50 returns 200 and attempts payload', async () => {
            const res = await fetch(`${baseUrl}/api/admin/payments?page=1&limit=50`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
            });
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(body.data.attempts !== undefined);
        });

        test('GET /api/admin/reviews returns 200 and reviews payload', async () => {
            const res = await fetch(`${baseUrl}/api/admin/reviews`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
            });
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(body.data.reviews !== undefined);
        });

        test('GET /api/admin/messages returns 200 and messages payload', async () => {
            const res = await fetch(`${baseUrl}/api/admin/messages`, {
                method: 'GET',
                headers: {
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
            });
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(body.data !== undefined);
        });

        test('POST /api/admin/delivery-zones returns 201 for valid zone creation', async () => {
            const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
                body: JSON.stringify({
                    name: 'Naya Ghat Area',
                    type: '0-3km',
                    deliveryFee: 15,
                    sortOrder: 2,
                }),
            });
            assert.equal(res.status, 201);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.zone.name, 'Naya Ghat Area');
            assert.equal(body.data.zone.deliveryFee, 15);
        });
    });

    // =========================================================================
    // 4. Input Validation & Error Handling
    // =========================================================================
    describe('4. Input validation middleware verifies requests', () => {
        test('POST /api/admin/delivery-zones rejects invalid zone type with 400', async () => {
            const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
                body: JSON.stringify({
                    name: 'Bad Zone',
                    type: 'invalid-distance',
                    deliveryFee: 15,
                }),
            });
            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
        });

        test('POST /api/admin/delivery-zones rejects fee mismatched with type (0-3km with 50)', async () => {
            const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `${config.cookie.name}=${adminToken}`,
                },
                body: JSON.stringify({
                    name: 'Mismatched Fee',
                    type: '0-3km',
                    deliveryFee: 50,
                }),
            });
            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
        });
    });
});
