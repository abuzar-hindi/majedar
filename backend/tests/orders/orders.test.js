import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Order } from '../../src/models/Order.js';
import { MenuItem } from '../../src/models/MenuItem.js';
import { Customer } from '../../src/models/Customer.js';
import { Admin } from '../../src/models/Admin.js';
import {
    createOrderSchema,
    orderIdParamSchema,
    updateOrderStatusSchema,
} from '../../src/validators/order.validator.js';
import * as orderService from '../../src/services/order/order.service.js';
import {
    restaurantConfig,
    setRestaurantOpen,
    setDeliveryFee,
    setMinimumOrderAmount,
} from '../../src/config/restaurant.config.js';
import { signToken } from '../../src/utils/token.js';
import { config } from '../../src/config/env.js';

describe('Order & Checkout Management Test Suite', () => {

    // ==========================================
    // 1. Zod Validation Tests
    // ==========================================
    describe('Order Validation Layer', () => {
        test('createOrderSchema validates valid checkout data', async () => {
            const validData = {
                items: [
                    { menuItem: '507f1f77bcf86cd799439011', quantity: 2 },
                    { menuItem: '507f1f77bcf86cd799439012', quantity: 1 },
                ],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Near Ram Mandir, Ayodhya',
                    landmark: 'Opposite Gate 3',
                    deliveryInstructions: 'Call on arrival',
                },
                orderType: 'delivery',
                paymentMethod: 'cod',
            };

            const result = await createOrderSchema.safeParseAsync(validData);
            assert.equal(result.success, true);
            assert.equal(result.data.items.length, 2);
            assert.equal(result.data.deliveryAddress.firstName, 'Aarav');
            assert.equal(result.data.deliveryAddress.deliveryInstructions, 'Call on arrival');
            assert.equal(result.data.paymentMethod, 'cod');
        });

        test('createOrderSchema accepts "Other" delivery instruction with custom text', async () => {
            const data = {
                items: [{ menuItem: '507f1f77bcf86cd799439011', quantity: 1 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                    deliveryInstructions: 'Other',
                    deliveryInstructionOther: 'Leave with security guard',
                },
            };

            const result = await createOrderSchema.safeParseAsync(data);
            assert.equal(result.success, true);
            assert.equal(result.data.deliveryAddress.deliveryInstructionOther, 'Leave with security guard');
        });

        test('createOrderSchema rejects "Other" delivery instruction without custom text', async () => {
            const data = {
                items: [{ menuItem: '507f1f77bcf86cd799439011', quantity: 1 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                    deliveryInstructions: 'Other',
                    deliveryInstructionOther: '   ',
                },
            };

            const result = await createOrderSchema.safeParseAsync(data);
            assert.equal(result.success, false);
            const issue = result.error.issues.find((i) => i.path.includes('deliveryInstructionOther'));
            assert.ok(issue, 'Should fail validation on deliveryInstructionOther');
        });

        test('createOrderSchema rejects empty items array', async () => {
            const result = await createOrderSchema.safeParseAsync({
                items: [],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                },
            });
            assert.equal(result.success, false);
        });

        test('createOrderSchema rejects invalid/malformed menu item ID', async () => {
            const result = await createOrderSchema.safeParseAsync({
                items: [{ menuItem: 'not-a-valid-id', quantity: 1 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                },
            });
            assert.equal(result.success, false);
        });

        test('createOrderSchema rejects zero or negative quantity', async () => {
            const zeroResult = await createOrderSchema.safeParseAsync({
                items: [{ menuItem: '507f1f77bcf86cd799439011', quantity: 0 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                },
            });
            assert.equal(zeroResult.success, false);

            const negResult = await createOrderSchema.safeParseAsync({
                items: [{ menuItem: '507f1f77bcf86cd799439011', quantity: -3 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                },
            });
            assert.equal(negResult.success, false);
        });

        test('createOrderSchema rejects missing address fields', async () => {
            const missingAddress = await createOrderSchema.safeParseAsync({
                items: [{ menuItem: '507f1f77bcf86cd799439011', quantity: 1 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    // missing address
                },
            });
            assert.equal(missingAddress.success, false);

            const missingPhone = await createOrderSchema.safeParseAsync({
                items: [{ menuItem: '507f1f77bcf86cd799439011', quantity: 1 }],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Sharma',
                    email: 'aarav@example.com',
                    address: 'Civil Lines, Ayodhya',
                },
            });
            assert.equal(missingPhone.success, false);
        });

        test('orderIdParamSchema validates correct 24-hex ObjectId and rejects malformed', async () => {
            const valid = await orderIdParamSchema.safeParseAsync({ id: '507f1f77bcf86cd799439011' });
            assert.equal(valid.success, true);

            const invalid = await orderIdParamSchema.safeParseAsync({ id: 'bad-order-id' });
            assert.equal(invalid.success, false);
        });

        test('updateOrderStatusSchema allows valid statuses and rejects unknown status', async () => {
            for (const status of ['placed', 'preparing', 'completed', 'cancelled']) {
                const res = await updateOrderStatusSchema.safeParseAsync({ orderStatus: status });
                assert.equal(res.success, true);
            }

            const invalid = await updateOrderStatusSchema.safeParseAsync({ orderStatus: 'shipped' });
            assert.equal(invalid.success, false);
        });
    });

    // ==========================================
    // 2. Business Rules, Pricing & Price Safety
    // ==========================================
    describe('Order Service Logic & Price Safety', () => {
        const sampleCustomerId = new mongoose.Types.ObjectId();
        const validItem1Id = new mongoose.Types.ObjectId();
        const validItem2Id = new mongoose.Types.ObjectId();

        test('Backend ignores frontend price and calculates trusted subtotal, delivery fee, and total', async () => {
            const origFind = MenuItem.find;
            const origSave = Order.prototype.save;
            let persistedOrder = null;

            MenuItem.find = async () => [
                {
                    _id: validItem1Id,
                    name: 'Paneer Butter Masala',
                    price: 250, // Trusted DB price
                    isAvailable: true,
                    image: { url: 'https://example.com/paneer.jpg' },
                },
            ];

            Order.prototype.save = async function () {
                persistedOrder = this;
                return this;
            };

            try {
                // Frontend maliciously tries to send price = 1
                const maliciousInput = {
                    items: [{ menuItem: validItem1Id.toString(), quantity: 2, price: 1, subtotal: 2 }],
                    deliveryAddress: {
                        firstName: 'Rahul',
                        lastName: 'Verma',
                        phone: '9876543210',
                        email: 'rahul@example.com',
                        address: 'Naya Ghat, Ayodhya',
                    },
                    orderType: 'delivery',
                    paymentMethod: 'cod',
                };

                const order = await orderService.createOrder(sampleCustomerId, maliciousInput);

                // Check calculations:
                // DB price = 250, quantity = 2 -> subtotal = 500
                // Tier 1 Delivery fee = 15 -> total = 515
                assert.equal(order.items[0].price, 250, 'Must use DB price, ignoring frontend');
                assert.equal(order.items[0].subtotal, 500);
                assert.equal(order.subtotal, 500);
                assert.equal(order.deliveryFee, 15);
                assert.equal(order.total, 515);
                assert.equal(order.orderStatus, 'placed');
                assert.equal(order.paymentStatus, 'pending');
                assert.equal(order.paymentMethod, 'cod');
                assert.ok(order.orderNumber.startsWith('MD-'), 'Should have generated orderNumber');
            } finally {
                MenuItem.find = origFind;
                Order.prototype.save = origSave;
            }
        });

        test('Correct subtotal calculation with multiple items', async () => {
            const origFind = MenuItem.find;
            const origSave = Order.prototype.save;

            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Item 1', price: 100, isAvailable: true },
                { _id: validItem2Id, name: 'Item 2', price: 80, isAvailable: true },
            ];
            Order.prototype.save = async function () { return this; };

            try {
                const order = await orderService.createOrder(sampleCustomerId, {
                    items: [
                        { menuItem: validItem1Id.toString(), quantity: 2 }, // 200
                        { menuItem: validItem2Id.toString(), quantity: 1 }, // 80
                    ],
                    deliveryAddress: {
                        firstName: 'Rahul',
                        lastName: 'Verma',
                        phone: '9876543210',
                        email: 'rahul@example.com',
                        address: 'Naya Ghat, Ayodhya',
                    },
                });

                assert.equal(order.subtotal, 280);
                assert.equal(order.deliveryFee, 15);
                assert.equal(order.total, 295);
                assert.equal(order.items.length, 2);
            } finally {
                MenuItem.find = origFind;
                Order.prototype.save = origSave;
            }
        });

        test('Consolidates duplicate menu item entries into single item snapshot', async () => {
            const origFind = MenuItem.find;
            const origSave = Order.prototype.save;

            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Butter Naan', price: 60, isAvailable: true },
            ];
            Order.prototype.save = async function () { return this; };

            try {
                // Sent twice: quantity 2 and quantity 3 -> total quantity 5
                const order = await orderService.createOrder(sampleCustomerId, {
                    items: [
                        { menuItem: validItem1Id.toString(), quantity: 2 },
                        { menuItem: validItem1Id.toString(), quantity: 3 },
                    ],
                    deliveryAddress: {
                        firstName: 'Rahul',
                        lastName: 'Verma',
                        phone: '9876543210',
                        email: 'rahul@example.com',
                        address: 'Naya Ghat, Ayodhya',
                    },
                });

                assert.equal(order.items.length, 1);
                assert.equal(order.items[0].quantity, 5);
                assert.equal(order.items[0].subtotal, 300);
                assert.equal(order.subtotal, 300);
            } finally {
                MenuItem.find = origFind;
                Order.prototype.save = origSave;
            }
        });

        test('Rejects order creation when restaurant is closed', async () => {
            setRestaurantOpen(false);

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 2 }],
                            deliveryAddress: {
                                firstName: 'Rahul',
                                lastName: 'Verma',
                                phone: '9876543210',
                                email: 'rahul@example.com',
                                address: 'Naya Ghat, Ayodhya',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /restaurant is currently closed/i);
                        return true;
                    }
                );
            } finally {
                setRestaurantOpen(true);
            }
        });

        test('Rejects order creation when subtotal is below minimum order amount (₹150)', async () => {
            const origFind = MenuItem.find;
            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Chai', price: 40, isAvailable: true },
            ];
            setMinimumOrderAmount(150);

            try {
                // 2 x 40 = 80 (< 150)
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 2 }],
                            deliveryAddress: {
                                firstName: 'Rahul',
                                lastName: 'Verma',
                                phone: '9876543210',
                                email: 'rahul@example.com',
                                address: 'Naya Ghat, Ayodhya',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /Minimum order amount is ₹150/i);
                        return true;
                    }
                );
            } finally {
                MenuItem.find = origFind;
                setMinimumOrderAmount(100);
            }
        });

        test('Rejects order creation when requested MenuItem is not found in database', async () => {
            const origFind = MenuItem.find;
            // DB returns empty array (item not found)
            MenuItem.find = async () => [];

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 2 }],
                            deliveryAddress: {
                                firstName: 'Rahul',
                                lastName: 'Verma',
                                phone: '9876543210',
                                email: 'rahul@example.com',
                                address: 'Naya Ghat, Ayodhya',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 404);
                        assert.match(err.message, /Menu item\(s\) not found/i);
                        return true;
                    }
                );
            } finally {
                MenuItem.find = origFind;
            }
        });

        test('Rejects order creation when MenuItem is marked unavailable', async () => {
            const origFind = MenuItem.find;
            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Special Kheer', price: 180, isAvailable: false },
            ];

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 1 }],
                            deliveryAddress: {
                                firstName: 'Rahul',
                                lastName: 'Verma',
                                phone: '9876543210',
                                email: 'rahul@example.com',
                                address: 'Naya Ghat, Ayodhya',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /currently unavailable/i);
                        return true;
                    }
                );
            } finally {
                MenuItem.find = origFind;
            }
        });
    });

    // ==========================================
    // 3. Customer Order Access & Security
    // ==========================================
    describe('Customer Order Access & Security', () => {
        const customerA = new mongoose.Types.ObjectId();
        const customerB = new mongoose.Types.ObjectId();
        const orderId = new mongoose.Types.ObjectId();

        test('Customer can view their own orders', async () => {
            const origFind = Order.find;
            Order.find = () => ({
                sort: async () => [
                    { _id: orderId, orderNumber: 'MD-1234', customer: customerA, total: 350 },
                ],
            });

            try {
                const orders = await orderService.getCustomerOrders(customerA);
                assert.equal(orders.length, 1);
                assert.equal(orders[0].orderNumber, 'MD-1234');
            } finally {
                Order.find = origFind;
            }
        });

        test('Customer can view their own order by ID', async () => {
            const origFindById = Order.findById;
            Order.findById = async (id) => {
                if (id.toString() === orderId.toString()) {
                    return { _id: orderId, customer: customerA, orderNumber: 'MD-1234' };
                }
                return null;
            };

            try {
                const order = await orderService.getCustomerOrderById(customerA, orderId.toString());
                assert.equal(order.orderNumber, 'MD-1234');
            } finally {
                Order.findById = origFindById;
            }
        });

        test('Customer cannot view another customer order (403 Forbidden)', async () => {
            const origFindById = Order.findById;
            Order.findById = async () => ({
                _id: orderId,
                customer: customerA, // Belongs to Customer A
                orderNumber: 'MD-1234',
            });

            try {
                // Customer B attempts to access Customer A's order
                await assert.rejects(
                    async () => {
                        await orderService.getCustomerOrderById(customerB, orderId.toString());
                    },
                    (err) => {
                        assert.equal(err.statusCode, 403);
                        assert.match(err.message, /permission to access this order/i);
                        return true;
                    }
                );
            } finally {
                Order.findById = origFindById;
            }
        });

        test('Returns 404 if order does not exist', async () => {
            const origFindById = Order.findById;
            Order.findById = async () => null;

            try {
                await assert.rejects(
                    async () => {
                        await orderService.getCustomerOrderById(customerA, '507f1f77bcf86cd799439099');
                    },
                    (err) => {
                        assert.equal(err.statusCode, 404);
                        return true;
                    }
                );
            } finally {
                Order.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 4. Admin Order Management & Status Flow
    // ==========================================
    describe('Admin Order Management', () => {
        const orderId = new mongoose.Types.ObjectId();

        test('Admin can view all orders with customer populated', async () => {
            const origFind = Order.find;
            Order.find = () => ({
                populate: () => ({
                    sort: async () => [
                        { _id: orderId, orderNumber: 'MD-999', total: 400, customer: { name: 'Customer One' } },
                    ],
                }),
            });

            try {
                const orders = await orderService.getAdminOrders();
                assert.equal(orders.length, 1);
                assert.equal(orders[0].orderNumber, 'MD-999');
            } finally {
                Order.find = origFind;
            }
        });

        test('Admin can update order status and keeps paymentStatus independent', async () => {
            const origFindById = Order.findById;
            const fakeOrder = {
                _id: orderId,
                orderStatus: 'placed',
                paymentStatus: 'pending',
                save: async function () { return this; },
            };
            Order.findById = async () => fakeOrder;

            try {
                // Update orderStatus to 'preparing'
                const updated = await orderService.updateOrderStatus(orderId.toString(), {
                    orderStatus: 'preparing',
                });
                assert.equal(updated.orderStatus, 'preparing');
                assert.equal(updated.paymentStatus, 'pending', 'paymentStatus must remain untouched');

                // Now update paymentStatus to 'paid'
                const updatedPayment = await orderService.updateOrderStatus(orderId.toString(), {
                    paymentStatus: 'paid',
                });
                assert.equal(updatedPayment.paymentStatus, 'paid');
                assert.equal(updatedPayment.orderStatus, 'preparing', 'orderStatus must remain untouched');
            } finally {
                Order.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 5. HTTP Integration Endpoints
    // ==========================================
    describe('HTTP Endpoints & Access Control', () => {
        let server;
        let baseUrl;

        const customerId = '507f1f77bcf86cd799439001';
        const otherCustomerId = '507f1f77bcf86cd799439002';
        const adminId = '507f1f77bcf86cd799439003';
        const testItemId = '507f1f77bcf86cd799439011';
        const testOrderId = '507f1f77bcf86cd799439099';

        let customerCookie;
        let adminCookie;

        let origCustomerFindById;
        let origAdminFindById;
        let origMenuItemFind;
        let origOrderSave;
        let origOrderFind;
        let origOrderFindById;

        before(async () => {
            // Generate valid JWT cookies
            const customerToken = signToken({ id: customerId, type: 'customer' });
            customerCookie = `${config.customerCookie.name}=${customerToken}`;

            const adminToken = signToken({ id: adminId, role: 'admin' });
            adminCookie = `${config.cookie.name}=${adminToken}`;

            // Stubs for DB operations
            origCustomerFindById = Customer.findById;
            origAdminFindById = Admin.findById;
            origMenuItemFind = MenuItem.find;
            origOrderSave = Order.prototype.save;
            origOrderFind = Order.find;
            origOrderFindById = Order.findById;

            Customer.findById = async (id) => {
                if (id.toString() === customerId) {
                    return { _id: customerId, name: 'Test Customer', email: 'cust@test.com' };
                }
                return null;
            };

            Admin.findById = async (id) => {
                if (id.toString() === adminId) {
                    return { _id: adminId, role: 'admin' };
                }
                return null;
            };

            MenuItem.find = async () => [
                {
                    _id: testItemId,
                    name: 'Paneer Butter Masala',
                    price: 250,
                    isAvailable: true,
                    image: { url: 'https://example.com/paneer.jpg' },
                },
            ];

            Order.prototype.save = async function () {
                this._id = testOrderId;
                return this;
            };

            server = http.createServer(app);
            await new Promise((resolve) => server.listen(0, resolve));
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
        });

        after(async () => {
            Customer.findById = origCustomerFindById;
            Admin.findById = origAdminFindById;
            MenuItem.find = origMenuItemFind;
            Order.prototype.save = origOrderSave;
            Order.find = origOrderFind;
            Order.findById = origOrderFindById;

            if (server) {
                await new Promise((resolve) => server.close(resolve));
            }
        });

        test('POST /api/orders rejects unauthenticated request with 401 Unauthorized', async () => {
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{ menuItem: testItemId, quantity: 1 }],
                    deliveryAddress: {
                        firstName: 'Test',
                        lastName: 'User',
                        phone: '9876543210',
                        email: 'test@example.com',
                        address: 'Ayodhya',
                    },
                }),
            });

            assert.equal(res.status, 401);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /authentication required/i);
        });

        test('POST /api/orders successfully places order for authenticated customer (201 Created)', async () => {
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: customerCookie,
                },
                body: JSON.stringify({
                    items: [{ menuItem: testItemId, quantity: 1, price: 10 }], // Malicious price sent
                    deliveryAddress: {
                        firstName: 'Aman',
                        lastName: 'Verma',
                        phone: '9876543210',
                        email: 'aman@example.com',
                        address: 'Civil Lines, Ayodhya',
                        landmark: 'Near Mandir',
                        deliveryInstructions: 'Call on arrival',
                    },
                    orderType: 'delivery',
                    paymentMethod: 'cod',
                }),
            });

            assert.equal(res.status, 201);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.order.items[0].price, 250, 'Backend ignored client price');
            assert.equal(body.data.order.subtotal, 250);
            assert.equal(body.data.order.deliveryFee, 15);
            assert.equal(body.data.order.total, 265);
            assert.equal(body.data.order.orderStatus, 'placed');
            assert.equal(body.data.order.paymentStatus, 'pending');
        });

        test('POST /api/orders validates and accepts selected tier 2 delivery fee (₹30)', async () => {
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: customerCookie,
                },
                body: JSON.stringify({
                    items: [{ menuItem: testItemId, quantity: 1 }],
                    deliveryAddress: {
                        firstName: 'Aman',
                        lastName: 'Verma',
                        phone: '9876543210',
                        email: 'aman@example.com',
                        address: 'Civil Lines, Ayodhya (4.2 km)',
                    },
                    orderType: 'delivery',
                    deliveryFee: 30,
                    paymentMethod: 'cod',
                }),
            });

            assert.equal(res.status, 201);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.order.deliveryFee, 30);
            assert.equal(body.data.order.total, 280);
        });

        test('POST /api/orders rejects invalid delivery fee outside allowed tiers', async () => {
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: customerCookie,
                },
                body: JSON.stringify({
                    items: [{ menuItem: testItemId, quantity: 1 }],
                    deliveryAddress: {
                        firstName: 'Aman',
                        lastName: 'Verma',
                        phone: '9876543210',
                        email: 'aman@example.com',
                        address: 'Civil Lines, Ayodhya',
                    },
                    orderType: 'delivery',
                    deliveryFee: 99, // Invalid fee!
                    paymentMethod: 'cod',
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /Invalid delivery fee/i);
        });

        test('GET /api/orders/my returns orders belonging to the customer (200 OK)', async () => {
            Order.find = () => ({
                sort: async () => [
                    { _id: testOrderId, orderNumber: 'MD-001', customer: customerId, total: 300 },
                ],
            });

            const res = await fetch(`${baseUrl}/api/orders/my`, {
                headers: { Cookie: customerCookie },
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.orders.length, 1);
            assert.equal(body.data.orders[0].orderNumber, 'MD-001');
        });

        test('GET /api/orders/:id returns customer own order (200 OK)', async () => {
            Order.findById = async (id) => {
                if (id === testOrderId) {
                    return { _id: testOrderId, customer: customerId, orderNumber: 'MD-001' };
                }
                return null;
            };

            const res = await fetch(`${baseUrl}/api/orders/${testOrderId}`, {
                headers: { Cookie: customerCookie },
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.order.orderNumber, 'MD-001');
        });

        test('GET /api/orders/:id rejects customer accessing another customer order (403 Forbidden)', async () => {
            Order.findById = async (id) => {
                if (id === testOrderId) {
                    return { _id: testOrderId, customer: otherCustomerId, orderNumber: 'MD-001' };
                }
                return null;
            };

            const res = await fetch(`${baseUrl}/api/orders/${testOrderId}`, {
                headers: { Cookie: customerCookie },
            });

            assert.equal(res.status, 403);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /permission to access this order/i);
        });

        test('GET /api/admin/orders rejects unauthenticated access (401 Unauthorized)', async () => {
            const res = await fetch(`${baseUrl}/api/admin/orders`);
            assert.equal(res.status, 401);
        });

        test('GET /api/admin/orders rejects customer token (401/403 Unauthorized)', async () => {
            const res = await fetch(`${baseUrl}/api/admin/orders`, {
                headers: { Cookie: customerCookie },
            });
            // customer token is not an admin session cookie
            assert.equal(res.status, 401);
        });

        test('GET /api/admin/orders returns order list for authenticated admin (200 OK)', async () => {
            Order.find = () => ({
                populate: () => ({
                    sort: async () => [
                        { _id: testOrderId, orderNumber: 'MD-ADMIN-1', customer: { name: 'Aman' } },
                    ],
                }),
            });

            const res = await fetch(`${baseUrl}/api/admin/orders`, {
                headers: { Cookie: adminCookie },
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.orders.length, 1);
        });

        test('GET /api/admin/orders/:id returns order details for admin (200 OK)', async () => {
            Order.findById = (id) => ({
                populate: async () => ({
                    _id: testOrderId,
                    orderNumber: 'MD-ADMIN-1',
                    customer: { name: 'Aman', email: 'aman@test.com' },
                }),
            });

            const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}`, {
                headers: { Cookie: adminCookie },
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.order.orderNumber, 'MD-ADMIN-1');
        });

        test('PATCH /api/admin/orders/:id/status updates order status (200 OK)', async () => {
            const fakeOrder = {
                _id: testOrderId,
                orderStatus: 'placed',
                paymentStatus: 'pending',
                save: async function () { return this; },
            };
            Order.findById = async () => fakeOrder;

            const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: adminCookie,
                },
                body: JSON.stringify({
                    orderStatus: 'preparing',
                }),
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.order.orderStatus, 'preparing');
            assert.equal(body.data.order.paymentStatus, 'pending');
        });
    });
});
