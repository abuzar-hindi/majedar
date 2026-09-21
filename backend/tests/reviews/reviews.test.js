import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Review } from '../../src/models/Review.js';
import { Order } from '../../src/models/Order.js';
import { MenuItem } from '../../src/models/MenuItem.js';
import { Customer } from '../../src/models/Customer.js';
import { Admin } from '../../src/models/Admin.js';
import {
    createReviewSchema,
    reviewIdParamSchema,
    menuItemIdParamSchema,
} from '../../src/validators/review.validator.js';
import * as reviewService from '../../src/services/review/review.service.js';
import * as menuService from '../../src/services/menu/menu.service.js';
import { signToken } from '../../src/utils/token.js';
import { config } from '../../src/config/env.js';

describe('Reviews & Ratings Management Test Suite', () => {

    // ==========================================
    // 1. Zod Validation Tests
    // ==========================================
    describe('Review Validation Layer', () => {
        const validOrderId = '507f1f77bcf86cd799439011';
        const validMenuItemId = '507f1f77bcf86cd799439022';

        test('createReviewSchema accepts valid review input with rating 1 to 5', async () => {
            for (let r = 1; r <= 5; r++) {
                const res = await createReviewSchema.safeParseAsync({
                    orderId: validOrderId,
                    menuItemId: validMenuItemId,
                    rating: r,
                });
                assert.equal(res.success, true);
            }
        });

        test('createReviewSchema rejects rating outside 1–5', async () => {
            for (const badRating of [0, 6, -1, 10, 4.5]) {
                const res = await createReviewSchema.safeParseAsync({
                    orderId: validOrderId,
                    menuItemId: validMenuItemId,
                    rating: badRating,
                });
                assert.equal(res.success, false, `Rating ${badRating} should be rejected`);
            }
        });

        test('createReviewSchema rejects malformed orderId or menuItemId', async () => {
            const badOrder = await createReviewSchema.safeParseAsync({
                orderId: 'not-a-valid-id',
                menuItemId: validMenuItemId,
                rating: 5,
            });
            assert.equal(badOrder.success, false);

            const badItem = await createReviewSchema.safeParseAsync({
                orderId: validOrderId,
                menuItemId: 'bad-item',
                rating: 5,
            });
            assert.equal(badItem.success, false);
        });

        test('reviewIdParamSchema validates valid 24-hex ObjectId and rejects malformed', async () => {
            const valid = await reviewIdParamSchema.safeParseAsync({ id: validOrderId });
            assert.equal(valid.success, true);

            const invalid = await reviewIdParamSchema.safeParseAsync({ id: 'invalid-id' });
            assert.equal(invalid.success, false);
        });

        test('menuItemIdParamSchema validates valid 24-hex ObjectId and rejects malformed', async () => {
            const valid = await menuItemIdParamSchema.safeParseAsync({ menuItemId: validMenuItemId });
            assert.equal(valid.success, true);

            const invalid = await menuItemIdParamSchema.safeParseAsync({ menuItemId: 'invalid-id' });
            assert.equal(invalid.success, false);
        });
    });

    // ==========================================
    // 2. Review Service Business Rules
    // ==========================================
    describe('Review Service Business Logic', () => {
        const customerA = new mongoose.Types.ObjectId();
        const customerB = new mongoose.Types.ObjectId();
        const orderId = new mongoose.Types.ObjectId();
        const menuItemId = new mongoose.Types.ObjectId();
        const unpurchasedItemId = new mongoose.Types.ObjectId();

        test('Customer can successfully create review for completed order item', async () => {
            const origOrderFindById = Order.findById;
            const origMenuItemFindById = MenuItem.findById;
            const origReviewFindOne = Review.findOne;
            const origReviewSave = Review.prototype.save;
            const origReviewPopulate = Review.prototype.populate;

            Order.findById = async () => ({
                _id: orderId,
                customer: customerA,
                orderStatus: 'completed',
                items: [{ menuItem: menuItemId, name: 'Paneer Tikka' }],
            });

            MenuItem.findById = async () => ({
                _id: menuItemId,
                name: 'Paneer Tikka',
            });

            Review.findOne = async () => null; // No duplicate

            Review.prototype.save = async function () { return this; };
            Review.prototype.populate = async function () { return this; };

            try {
                const review = await reviewService.createReview(customerA, {
                    orderId: orderId.toString(),
                    menuItemId: menuItemId.toString(),
                    rating: 5,
                });

                assert.equal(review.rating, 5);
                assert.equal(review.customer.toString(), customerA.toString());
                assert.equal(review.menuItem.toString(), menuItemId.toString());
            } finally {
                Order.findById = origOrderFindById;
                MenuItem.findById = origMenuItemFindById;
                Review.findOne = origReviewFindOne;
                Review.prototype.save = origReviewSave;
                Review.prototype.populate = origReviewPopulate;
            }
        });

        test('Customer cannot review another customer order (403 Forbidden)', async () => {
            const origOrderFindById = Order.findById;
            Order.findById = async () => ({
                _id: orderId,
                customer: customerA, // Belongs to customer A
                orderStatus: 'completed',
                items: [{ menuItem: menuItemId }],
            });

            try {
                // Customer B attempts to review Customer A's order
                await assert.rejects(
                    async () => {
                        await reviewService.createReview(customerB, {
                            orderId: orderId.toString(),
                            menuItemId: menuItemId.toString(),
                            rating: 4,
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 403);
                        assert.match(err.message, /own orders/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origOrderFindById;
            }
        });

        test('Customer cannot review before order completion (400 Bad Request)', async () => {
            const origOrderFindById = Order.findById;

            for (const status of ['placed', 'preparing', 'cancelled']) {
                Order.findById = async () => ({
                    _id: orderId,
                    customer: customerA,
                    orderStatus: status, // Not completed
                    items: [{ menuItem: menuItemId }],
                });

                try {
                    await assert.rejects(
                        async () => {
                            await reviewService.createReview(customerA, {
                                orderId: orderId.toString(),
                                menuItemId: menuItemId.toString(),
                                rating: 4,
                            });
                        },
                        (err) => {
                            assert.equal(err.statusCode, 400);
                            assert.match(err.message, /after your order is completed/i);
                            return true;
                        }
                    );
                } finally {
                    Order.findById = origOrderFindById;
                }
            }
        });

        test('Customer cannot review an item not present in the order (400 Bad Request)', async () => {
            const origOrderFindById = Order.findById;
            const origMenuItemFindById = MenuItem.findById;

            Order.findById = async () => ({
                _id: orderId,
                customer: customerA,
                orderStatus: 'completed',
                items: [{ menuItem: menuItemId }], // Only menuItemId was purchased
            });

            MenuItem.findById = async () => ({
                _id: unpurchasedItemId,
                name: 'Gulab Jamun',
            });

            try {
                await assert.rejects(
                    async () => {
                        await reviewService.createReview(customerA, {
                            orderId: orderId.toString(),
                            menuItemId: unpurchasedItemId.toString(),
                            rating: 5,
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /not part of the specified order/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origOrderFindById;
                MenuItem.findById = origMenuItemFindById;
            }
        });

        test('Duplicate review for same customer + order + menuItem is rejected (400 Bad Request)', async () => {
            const origOrderFindById = Order.findById;
            const origMenuItemFindById = MenuItem.findById;
            const origReviewFindOne = Review.findOne;

            Order.findById = async () => ({
                _id: orderId,
                customer: customerA,
                orderStatus: 'completed',
                items: [{ menuItem: menuItemId }],
            });

            MenuItem.findById = async () => ({
                _id: menuItemId,
                name: 'Paneer Tikka',
            });

            // Simulate existing review
            Review.findOne = async () => ({
                _id: new mongoose.Types.ObjectId(),
                customer: customerA,
                order: orderId,
                menuItem: menuItemId,
                rating: 5,
            });

            try {
                await assert.rejects(
                    async () => {
                        await reviewService.createReview(customerA, {
                            orderId: orderId.toString(),
                            menuItemId: menuItemId.toString(),
                            rating: 4,
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /already reviewed this menu item/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origOrderFindById;
                MenuItem.findById = origMenuItemFindById;
                Review.findOne = origReviewFindOne;
            }
        });
    });

    // ==========================================
    // 3. Rating Aggregations & Public Display
    // ==========================================
    describe('Rating Summary & Review Count Calculation', () => {
        const testItemId = new mongoose.Types.ObjectId();

        test('Calculates correct average rating rounded to 1 decimal and review count', async () => {
            const origAggregate = Review.aggregate;

            // Mock aggregation result: 3 reviews (5, 4, 4) -> sum = 13, avg = 4.3333...
            Review.aggregate = async () => [
                {
                    _id: testItemId,
                    averageRating: 4.33333333333,
                    reviewCount: 3,
                },
            ];

            try {
                const summary = await reviewService.getMenuItemRatingSummary(testItemId.toString());
                assert.equal(summary.averageRating, 4.3);
                assert.equal(summary.reviewCount, 3);
            } finally {
                Review.aggregate = origAggregate;
            }
        });

        test('Returns 0 average rating and 0 review count when no reviews exist', async () => {
            const origAggregate = Review.aggregate;
            Review.aggregate = async () => [];

            try {
                const summary = await reviewService.getMenuItemRatingSummary(testItemId.toString());
                assert.equal(summary.averageRating, 0);
                assert.equal(summary.reviewCount, 0);
            } finally {
                Review.aggregate = origAggregate;
            }
        });

        test('Menu API exposes rating summary on item objects', async () => {
            const origFind = MenuItem.find;
            const origAggregate = Review.aggregate;

            MenuItem.find = () => ({
                populate: () => ({
                    sort: () => ({
                        exec: async () => [
                            {
                                _id: testItemId,
                                name: 'Dal Makhani',
                                price: 160,
                                isAvailable: true,
                                category: { isActive: true },
                            },
                        ],
                    }),
                }),
            });

            Review.aggregate = async () => [
                {
                    _id: testItemId,
                    averageRating: 4.8,
                    reviewCount: 25,
                },
            ];

            try {
                const items = await menuService.getMenuItems({ isPublic: true });
                assert.equal(items.length, 1);
                assert.equal(items[0].averageRating, 4.8);
                assert.equal(items[0].reviewCount, 25);
                assert.deepEqual(items[0].ratingSummary, {
                    averageRating: 4.8,
                    reviewCount: 25,
                });
            } finally {
                MenuItem.find = origFind;
                Review.aggregate = origAggregate;
            }
        });
    });

    // ==========================================
    // 4. HTTP Integration Endpoints
    // ==========================================
    describe('HTTP Endpoints, Auth & Admin Moderation', () => {
        let server;
        let baseUrl;

        const customerId = '507f1f77bcf86cd799439001';
        const otherCustomerId = '507f1f77bcf86cd799439002';
        const adminId = '507f1f77bcf86cd799439003';
        const testItemId = '507f1f77bcf86cd799439011';
        const testOrderId = '507f1f77bcf86cd799439099';
        const reviewId = '507f1f77bcf86cd799439088';

        let customerCookie;
        let adminCookie;

        let origCustomerFindById;
        let origAdminFindById;
        let origOrderFindById;
        let origMenuItemFindById;
        let origReviewFindOne;
        let origReviewSave;
        let origReviewFind;
        let origReviewCount;
        let origReviewFindByIdAndDelete;
        let origReviewAggregate;

        before(async () => {
            const customerToken = signToken({ id: customerId, type: 'customer' });
            customerCookie = `${config.customerCookie.name}=${customerToken}`;

            const adminToken = signToken({ id: adminId, role: 'admin' });
            adminCookie = `${config.cookie.name}=${adminToken}`;

            origCustomerFindById = Customer.findById;
            origAdminFindById = Admin.findById;
            origOrderFindById = Order.findById;
            origMenuItemFindById = MenuItem.findById;
            origReviewFindOne = Review.findOne;
            origReviewSave = Review.prototype.save;
            origReviewFind = Review.find;
            origReviewCount = Review.countDocuments;
            origReviewFindByIdAndDelete = Review.findByIdAndDelete;
            origReviewAggregate = Review.aggregate;

            Customer.findById = async (id) => {
                if (id === customerId) return { _id: customerId, name: 'Aarav Sharma' };
                if (id === otherCustomerId) return { _id: otherCustomerId, name: 'Pooja Patel' };
                return null;
            };

            Admin.findById = async (id) => {
                if (id === adminId) return { _id: adminId, role: 'admin' };
                return null;
            };

            server = http.createServer(app);
            await new Promise((resolve) => server.listen(0, resolve));
            baseUrl = `http://127.0.0.1:${server.address().port}`;
        });

        after(async () => {
            Customer.findById = origCustomerFindById;
            Admin.findById = origAdminFindById;
            Order.findById = origOrderFindById;
            MenuItem.findById = origMenuItemFindById;
            Review.findOne = origReviewFindOne;
            Review.prototype.save = origReviewSave;
            Review.find = origReviewFind;
            Review.countDocuments = origReviewCount;
            Review.findByIdAndDelete = origReviewFindByIdAndDelete;
            Review.aggregate = origReviewAggregate;

            if (server) {
                await new Promise((resolve) => server.close(resolve));
            }
        });

        test('POST /api/reviews rejects unauthenticated request with 401 Unauthorized', async () => {
            const res = await fetch(`${baseUrl}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: testOrderId,
                    menuItemId: testItemId,
                    rating: 5,
                }),
            });

            assert.equal(res.status, 401);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /authentication required/i);
        });

        test('POST /api/reviews creates review successfully for authenticated customer (201 Created)', async () => {
            Order.findById = async () => ({
                _id: testOrderId,
                customer: customerId,
                orderStatus: 'completed',
                items: [{ menuItem: testItemId, name: 'Paneer Tikka' }],
            });

            MenuItem.findById = async () => ({
                _id: testItemId,
                name: 'Paneer Tikka',
            });

            Review.findOne = async () => null;

            Review.prototype.save = async function () {
                this._id = new mongoose.Types.ObjectId(reviewId);
                return this;
            };

            Review.prototype.populate = async function () {
                return this;
            };

            const res = await fetch(`${baseUrl}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: customerCookie,
                },
                body: JSON.stringify({
                    orderId: testOrderId,
                    menuItemId: testItemId,
                    rating: 5,
                }),
            });

            assert.equal(res.status, 201);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.review.rating, 5);
        });

        test('GET /api/menu/:menuItemId/reviews returns reviews without sensitive customer details', async () => {
            Review.find = () => ({
                sort: () => ({
                    skip: () => ({
                        limit: () => ({
                            populate: () => ({
                                lean: async () => [
                                    {
                                        _id: reviewId,
                                        rating: 5,
                                        customer: {
                                            firstName: 'Aarav',
                                            lastName: 'Sharma',
                                            name: 'Aarav Sharma',
                                            avatar: null,
                                            // email, phone, password must NOT be exposed
                                        },
                                        createdAt: new Date(),
                                    },
                                ],
                            }),
                        }),
                    }),
                }),
            });

            Review.countDocuments = async () => 1;
            Review.aggregate = async () => [
                { _id: testItemId, averageRating: 5.0, reviewCount: 1 },
            ];

            const res = await fetch(`${baseUrl}/api/menu/${testItemId}/reviews`);
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.reviews.length, 1);
            assert.equal(body.data.reviews[0].customer.firstName, 'Aarav');
            assert.equal(body.data.reviews[0].customer.email, undefined, 'Sensitive customer email must not be exposed');
            assert.equal(body.data.reviews[0].customer.phone, undefined, 'Sensitive customer phone must not be exposed');
            assert.equal(body.data.ratingSummary.averageRating, 5.0);
            assert.equal(body.data.ratingSummary.reviewCount, 1);
        });

        test('DELETE /api/admin/reviews/:id rejects unauthenticated request (401 Unauthorized)', async () => {
            const res = await fetch(`${baseUrl}/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
            });

            assert.equal(res.status, 401);
        });

        test('DELETE /api/admin/reviews/:id rejects customer token (401/403 Unauthorized)', async () => {
            const res = await fetch(`${baseUrl}/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    Cookie: customerCookie,
                },
            });

            assert.ok(res.status === 401 || res.status === 403);
        });

        test('DELETE /api/admin/reviews/:id allows authenticated admin to delete review (200 OK)', async () => {
            Review.findByIdAndDelete = async () => ({
                _id: reviewId,
            });

            const res = await fetch(`${baseUrl}/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    Cookie: adminCookie,
                },
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.match(body.message, /deleted successfully/i);
        });

        test('GET /api/admin/reviews allows authenticated admin to view all reviews (200 OK)', async () => {
            Review.find = () => ({
                sort: () => ({
                    skip: () => ({
                        limit: () => ({
                            populate: () => ({
                                populate: () => ({
                                    populate: () => ({
                                        lean: async () => [
                                            {
                                                _id: reviewId,
                                                rating: 5,
                                                customer: { name: 'Customer One' },
                                                menuItem: { name: 'Paneer' },
                                            },
                                        ],
                                    }),
                                }),
                            }),
                        }),
                    }),
                }),
            });
            Review.countDocuments = async () => 1;

            const res = await fetch(`${baseUrl}/api/admin/reviews`, {
                headers: {
                    Cookie: adminCookie,
                },
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.reviews.length, 1);
        });
    });
});
