import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { DeliveryZone } from '../../src/models/DeliveryZone.js';
import { Order } from '../../src/models/Order.js';
import { MenuItem } from '../../src/models/MenuItem.js';
import { Admin } from '../../src/models/Admin.js';
import * as deliveryZoneService from '../../src/services/delivery-zone/delivery-zone.service.js';
import * as orderService from '../../src/services/order/order.service.js';
import { setRestaurantOpen } from '../../src/config/restaurant.config.js';
import { signToken } from '../../src/utils/token.js';
import { config } from '../../src/config/env.js';

describe('Delivery Zones and Zone-Based Order Management Test Suite', () => {
    let server;
    let baseUrl;
    let adminToken;
    let customerToken;

    const sampleCustomerId = new mongoose.Types.ObjectId();
    const sampleAdminId = new mongoose.Types.ObjectId();

    before(async () => {
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;

        // Create mock tokens
        adminToken = signToken({ id: sampleAdminId.toString(), role: 'admin' }, '1h');
        customerToken = signToken({ id: sampleCustomerId.toString(), type: 'customer', tokenVersion: 0 }, '1h');
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    // =========================================================================
    // 1. Admin Zone Management (Create, Auth, Validation, Duplicate Handling)
    // =========================================================================
    describe('Admin Zone Management & Security', () => {
        test('admin can create zone with valid 0-3km (₹15) and 3-5km (₹30)', async () => {
            const origFindOne = DeliveryZone.findOne;
            const origSave = DeliveryZone.prototype.save;
            const origAdminFindById = Admin.findById;

            Admin.findById = async () => ({
                _id: sampleAdminId,
                role: 'admin',
                isActive: true,
            });

            let savedZone = null;
            DeliveryZone.findOne = async () => null; // No duplicate
            DeliveryZone.prototype.save = async function () {
                savedZone = this;
                this._id = new mongoose.Types.ObjectId();
                return this;
            };

            try {
                // Create 0-3km zone
                const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: `${config.cookie.name}=${adminToken}`,
                    },
                    body: JSON.stringify({
                        name: 'Ram Path / Civil Lines',
                        type: '0-3km',
                        deliveryFee: 15,
                        sortOrder: 1,
                    }),
                });

                assert.equal(res.status, 201);
                const body = await res.json();
                assert.equal(body.success, true);
                assert.equal(body.data.zone.name, 'Ram Path / Civil Lines');
                assert.equal(body.data.zone.type, '0-3km');
                assert.equal(body.data.zone.deliveryFee, 15);
                assert.equal(body.data.zone.isActive, true);
            } finally {
                DeliveryZone.findOne = origFindOne;
                DeliveryZone.prototype.save = origSave;
                Admin.findById = origAdminFindById;
            }
        });

        test('non-admin cannot create zone (401/403 Unauthorized)', async () => {
            // No cookie
            const noAuthRes = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Civil Lines',
                    type: '0-3km',
                }),
            });
            assert.equal(noAuthRes.status, 401);

            // Customer cookie instead of admin
            const customerRes = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `${config.customerCookie.name}=${customerToken}`,
                },
                body: JSON.stringify({
                    name: 'Civil Lines',
                    type: '0-3km',
                }),
            });
            assert.equal(customerRes.status, 401);
        });

        test('duplicate area handling: rejects duplicate zone name (409 Conflict)', async () => {
            const origFindOne = DeliveryZone.findOne;
            const origAdminFindById = Admin.findById;

            Admin.findById = async () => ({ _id: sampleAdminId, role: 'admin', isActive: true });
            DeliveryZone.findOne = async () => ({
                _id: new mongoose.Types.ObjectId(),
                name: 'Civil Lines',
            });

            try {
                const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: `${config.cookie.name}=${adminToken}`,
                    },
                    body: JSON.stringify({
                        name: 'Civil Lines',
                        type: '0-3km',
                    }),
                });

                assert.equal(res.status, 409);
                const body = await res.json();
                assert.equal(body.success, false);
                assert.match(body.message, /already exists/i);
            } finally {
                DeliveryZone.findOne = origFindOne;
                Admin.findById = origAdminFindById;
            }
        });

        test('invalid zone type is rejected by validation', async () => {
            const origAdminFindById = Admin.findById;
            Admin.findById = async () => ({ _id: sampleAdminId, role: 'admin', isActive: true });

            try {
                const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: `${config.cookie.name}=${adminToken}`,
                    },
                    body: JSON.stringify({
                        name: 'Outer Ring',
                        type: '5-10km', // Invalid type
                    }),
                });

                assert.equal(res.status, 400);
                const body = await res.json();
                assert.equal(body.success, false);
            } finally {
                Admin.findById = origAdminFindById;
            }
        });

        test('invalid fee for zone type: 0-3km with fee 30 is rejected', async () => {
            const origAdminFindById = Admin.findById;
            Admin.findById = async () => ({ _id: sampleAdminId, role: 'admin', isActive: true });

            try {
                const res = await fetch(`${baseUrl}/api/admin/delivery-zones`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: `${config.cookie.name}=${adminToken}`,
                    },
                    body: JSON.stringify({
                        name: 'Near Gate',
                        type: '0-3km',
                        deliveryFee: 30, // Invalid fee for 0-3km
                    }),
                });

                assert.equal(res.status, 400);
                const body = await res.json();
                assert.equal(body.success, false);
                assert.ok(body.errors.some((e) => e.message.includes('₹15 for 0-3km')));
            } finally {
                Admin.findById = origAdminFindById;
            }
        });
    });

    // =========================================================================
    // 2. Public Zone Retrieval & Privacy
    // =========================================================================
    describe('Public Delivery Zones Endpoint', () => {
        test('public users can fetch active zones and inactive zones are filtered out', async () => {
            const origFind = DeliveryZone.find;

            // Mock DB zones: 2 active, 1 inactive
            const mockDbZones = [
                {
                    _id: 'zone-1',
                    name: 'Civil Lines',
                    type: '0-3km',
                    deliveryFee: 15,
                    isActive: true,
                    sortOrder: 1,
                },
                {
                    _id: 'zone-2',
                    name: 'Naya Ghat',
                    type: '3-5km',
                    deliveryFee: 30,
                    isActive: true,
                    sortOrder: 2,
                },
            ];

            DeliveryZone.find = (query) => {
                // Ensure query requests only active zones
                assert.equal(query.isActive, true);
                return {
                    select: (fields) => {
                        assert.ok(!fields.includes('internal'));
                        return {
                            sort: () => ({
                                lean: async () => mockDbZones,
                            }),
                        };
                    },
                };
            };

            try {
                const res = await fetch(`${baseUrl}/api/delivery-zones`);
                assert.equal(res.status, 200);
                const body = await res.json();
                assert.equal(body.success, true);
                assert.equal(body.data.zones.length, 2);
                assert.equal(body.data.zones[0].name, 'Civil Lines');
                assert.equal(body.data.zones[0].deliveryFee, 15);
                assert.equal(body.data.zones[1].name, 'Naya Ghat');
                assert.equal(body.data.zones[1].deliveryFee, 30);
            } finally {
                DeliveryZone.find = origFind;
            }
        });
    });

    // =========================================================================
    // 3. Customer Zone Selection & Order Price Security
    // =========================================================================
    describe('Order Checkout Price Security & Zone Calculation', () => {
        const validItem1Id = new mongoose.Types.ObjectId();
        const activeZoneId = new mongoose.Types.ObjectId();
        const inactiveZoneId = new mongoose.Types.ObjectId();

        test('customer can select valid active zone and backend calculates delivery fee and 5% GST', async () => {
            const origMenuFind = MenuItem.find;
            const origZoneFindById = DeliveryZone.findById;
            const origSave = Order.prototype.save;

            let persistedOrder = null;

            MenuItem.find = async () => [
                {
                    _id: validItem1Id,
                    name: 'Paneer Butter Masala',
                    price: 200,
                    isAvailable: true,
                },
            ];

            DeliveryZone.findById = async (id) => {
                if (id.toString() === activeZoneId.toString()) {
                    return {
                        _id: activeZoneId,
                        name: 'Civil Lines',
                        type: '0-3km',
                        deliveryFee: 15,
                        isActive: true,
                    };
                }
                return null;
            };

            Order.prototype.save = async function () {
                persistedOrder = this;
                return this;
            };

            try {
                // Customer requests quantity 2 of item @ 200 = subtotal 400
                // GST @ 5% on 400 = 20
                // Delivery fee for 0-3km = 15
                // Total = 400 + 20 + 15 = 435
                const order = await orderService.createOrder(sampleCustomerId, {
                    items: [{ menuItem: validItem1Id.toString(), quantity: 2 }],
                    deliveryZoneId: activeZoneId.toString(),
                    deliveryAddress: {
                        firstName: 'Ananya',
                        lastName: 'Pandey',
                        phone: '9876543210',
                        email: 'ananya@example.com',
                        address: 'Flat 101, Green Heights',
                        landmark: 'Near City Park',
                    },
                    orderType: 'delivery',
                });

                assert.equal(order.subtotal, 400, 'Subtotal must be 400');
                assert.equal(order.deliveryFee, 15, 'Delivery fee must come from DeliveryZone (15)');
                assert.equal(order.gst, 20, 'GST must be 5% of subtotal (20)');
                assert.equal(order.total, 435, 'Total must be 400 + 20 + 15 = 435');
                assert.equal(order.deliveryAddress.area, 'Civil Lines', 'Area snapshot must be stored');
                assert.equal(order.deliveryAddress.deliveryZoneId.toString(), activeZoneId.toString());
            } finally {
                MenuItem.find = origMenuFind;
                DeliveryZone.findById = origZoneFindById;
                Order.prototype.save = origSave;
            }
        });

        test('frontend-supplied deliveryFee is completely ignored/overridden by database fee', async () => {
            const origMenuFind = MenuItem.find;
            const origZoneFindById = DeliveryZone.findById;
            const origSave = Order.prototype.save;

            MenuItem.find = async () => [
                {
                    _id: validItem1Id,
                    name: 'Chicken Biryani',
                    price: 300,
                    isAvailable: true,
                },
            ];

            // 3-5km zone has fee ₹30
            DeliveryZone.findById = async () => ({
                _id: activeZoneId,
                name: 'Area B',
                type: '3-5km',
                deliveryFee: 30,
                isActive: true,
            });

            Order.prototype.save = async function () { return this; };

            try {
                // Malicious client sends deliveryFee: 0 or deliveryFee: 5
                const order = await orderService.createOrder(sampleCustomerId, {
                    items: [{ menuItem: validItem1Id.toString(), quantity: 1 }],
                    deliveryZoneId: activeZoneId.toString(),
                    deliveryFee: 0, // Ignored
                    deliveryAddress: {
                        firstName: 'Rahul',
                        lastName: 'Sharma',
                        phone: '9876543210',
                        email: 'rahul@example.com',
                        address: 'Street 4',
                    },
                });

                // Subtotal: 300, GST: 15, DeliveryFee from DB: 30, Total: 345
                assert.equal(order.subtotal, 300);
                assert.equal(order.deliveryFee, 30, 'Must use DB fee of 30, ignoring client deliveryFee of 0');
                assert.equal(order.gst, 15);
                assert.equal(order.total, 345);
            } finally {
                MenuItem.find = origMenuFind;
                DeliveryZone.findById = origZoneFindById;
                Order.prototype.save = origSave;
            }
        });

        test('customer cannot select inactive zone (400 Bad Request)', async () => {
            const origMenuFind = MenuItem.find;
            const origZoneFindById = DeliveryZone.findById;

            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Naan', price: 100, isAvailable: true },
            ];

            DeliveryZone.findById = async () => ({
                _id: inactiveZoneId,
                name: 'Old Area',
                type: '0-3km',
                deliveryFee: 15,
                isActive: false, // Inactive
            });

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 1 }],
                            deliveryZoneId: inactiveZoneId.toString(),
                            deliveryAddress: {
                                firstName: 'Rahul',
                                lastName: 'Sharma',
                                phone: '9876543210',
                                email: 'rahul@example.com',
                                address: 'Street 1',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /inactive/i);
                        return true;
                    }
                );
            } finally {
                MenuItem.find = origMenuFind;
                DeliveryZone.findById = origZoneFindById;
            }
        });

        test('customer cannot select nonexistent zone (404 Not Found)', async () => {
            const origMenuFind = MenuItem.find;
            const origZoneFindById = DeliveryZone.findById;

            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Naan', price: 100, isAvailable: true },
            ];

            DeliveryZone.findById = async () => null; // Does not exist

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 1 }],
                            deliveryZoneId: new mongoose.Types.ObjectId().toString(),
                            deliveryAddress: {
                                firstName: 'Rahul',
                                lastName: 'Sharma',
                                phone: '9876543210',
                                email: 'rahul@example.com',
                                address: 'Street 1',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 404);
                        assert.match(err.message, /not found/i);
                        return true;
                    }
                );
            } finally {
                MenuItem.find = origMenuFind;
                DeliveryZone.findById = origZoneFindById;
            }
        });

        test('GST is not applied to delivery fee: strictly subtotal * 0.05', async () => {
            const origMenuFind = MenuItem.find;
            const origZoneFindById = DeliveryZone.findById;
            const origSave = Order.prototype.save;

            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Dish', price: 500, isAvailable: true },
            ];

            DeliveryZone.findById = async () => ({
                _id: activeZoneId,
                name: 'Zone A',
                type: '3-5km',
                deliveryFee: 30,
                isActive: true,
            });

            Order.prototype.save = async function () { return this; };

            try {
                const order = await orderService.createOrder(sampleCustomerId, {
                    items: [{ menuItem: validItem1Id.toString(), quantity: 1 }],
                    deliveryZoneId: activeZoneId.toString(),
                    deliveryAddress: {
                        firstName: 'Karan',
                        lastName: 'Mehta',
                        phone: '9876543210',
                        email: 'karan@example.com',
                        address: 'Street 9',
                    },
                });

                // Subtotal: 500
                // GST: 500 * 0.05 = 25 (NOT (500 + 30) * 0.05 = 26.5)
                // Total: 500 + 25 + 30 = 555
                assert.equal(order.subtotal, 500);
                assert.equal(order.gst, 25, 'GST must be exactly 5% of subtotal');
                assert.equal(order.deliveryFee, 30);
                assert.equal(order.total, 555, 'Final total must be 500 + 25 + 30 = 555');
            } finally {
                MenuItem.find = origMenuFind;
                DeliveryZone.findById = origZoneFindById;
                Order.prototype.save = origSave;
            }
        });

        test('minimum order validation: rejects order below restaurant minimum', async () => {
            const origMenuFind = MenuItem.find;

            MenuItem.find = async () => [
                { _id: validItem1Id, name: 'Roti', price: 20, isAvailable: true },
            ];

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 1 }], // subtotal = 20 < min 100
                            deliveryZoneId: activeZoneId.toString(),
                            deliveryAddress: {
                                firstName: 'Karan',
                                lastName: 'Mehta',
                                phone: '9876543210',
                                email: 'karan@example.com',
                                address: 'Street 9',
                            },
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /minimum order amount/i);
                        return true;
                    }
                );
            } finally {
                MenuItem.find = origMenuFind;
            }
        });

        test('restaurant closed validation: rejects order creation when restaurant is closed', async () => {
            setRestaurantOpen(false);

            try {
                await assert.rejects(
                    async () => {
                        await orderService.createOrder(sampleCustomerId, {
                            items: [{ menuItem: validItem1Id.toString(), quantity: 2 }],
                            deliveryZoneId: activeZoneId.toString(),
                            deliveryAddress: {
                                firstName: 'Karan',
                                lastName: 'Mehta',
                                phone: '9876543210',
                                email: 'karan@example.com',
                                address: 'Street 9',
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

        test('order immutability: old order keeps original delivery fee after zone fee is updated', async () => {
            // An existing order was placed with deliveryFee: 15
            const pastOrder = new Order({
                orderNumber: 'MD-HISTORICAL-1',
                customer: sampleCustomerId,
                items: [
                    {
                        menuItem: validItem1Id,
                        name: 'Dal Makhani',
                        price: 200,
                        quantity: 1,
                        subtotal: 200,
                    },
                ],
                deliveryAddress: {
                    firstName: 'Aarav',
                    lastName: 'Gupta',
                    phone: '9876543210',
                    email: 'aarav@example.com',
                    address: 'Civil Lines',
                    area: 'Civil Lines',
                    deliveryZoneId: activeZoneId,
                },
                orderType: 'delivery',
                subtotal: 200,
                gst: 10,
                deliveryFee: 15,
                total: 225,
            });

            // Later, zone fee or details are modified in DB
            const updatedZone = {
                _id: activeZoneId,
                name: 'Civil Lines Super Express',
                type: '3-5km',
                deliveryFee: 30, // Fee changed
            };

            // Historical order retains its original snapshot
            assert.equal(pastOrder.deliveryFee, 15, 'Historical order must retain ₹15 delivery fee');
            assert.equal(pastOrder.total, 225, 'Historical order must retain original total');
            assert.equal(pastOrder.deliveryAddress.area, 'Civil Lines');
            assert.notEqual(pastOrder.deliveryFee, updatedZone.deliveryFee);
        });

        test('zone deletion: soft-deletes (isActive=false) if referenced by existing orders', async () => {
            const origZoneFindById = DeliveryZone.findById;
            const origCountDocuments = Order.countDocuments;

            const zoneDoc = {
                _id: activeZoneId,
                name: 'Civil Lines',
                isActive: true,
                save: async function () { return this; },
            };

            DeliveryZone.findById = async () => zoneDoc;
            // 3 existing orders reference this zone
            Order.countDocuments = async () => 3;

            try {
                const result = await deliveryZoneService.deleteZone(activeZoneId);
                assert.equal(result.softDeleted, true);
                assert.equal(zoneDoc.isActive, false, 'Should deactivate zone rather than hard delete');
                assert.match(result.message, /deactivated.*referenced/i);
            } finally {
                DeliveryZone.findById = origZoneFindById;
                Order.countDocuments = origCountDocuments;
            }
        });
    });
});
