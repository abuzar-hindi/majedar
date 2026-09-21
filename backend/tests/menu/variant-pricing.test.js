import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { MenuItem } from '../../src/models/MenuItem.js';
import { Category } from '../../src/models/Category.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../../src/validators/menu.validator.js';
import * as orderService from '../../src/services/order/order.service.js';
import { setRestaurantOpen } from '../../src/config/restaurant.config.js';

describe('Menu Variant Pricing & Order Calculations Suite', () => {
    let testCategory;
    let singleItem;
    let halfFullItem;

    before(async () => {
        setRestaurantOpen(true);
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/majedar_test');
        }

        // Create test category
        testCategory = await Category.create({
            name: `Test Cat ${Date.now()}`,
            isActive: true,
        });

        // Create single-priced item
        singleItem = await MenuItem.create({
            name: `Single Biryani ${Date.now()}`,
            description: 'Delicious aromatic single price biryani',
            category: testCategory._id,
            pricingType: 'single',
            price: 180,
            isAvailable: true,
        });

        // Create half-full item
        halfFullItem = await MenuItem.create({
            name: `Half Full Chicken ${Date.now()}`,
            description: 'Chicken curry with half and full options',
            category: testCategory._id,
            pricingType: 'half-full',
            halfPrice: 120,
            fullPrice: 220,
            isAvailable: true,
        });
    });

    after(async () => {
        if (testCategory) await Category.findByIdAndDelete(testCategory._id);
        if (singleItem) await MenuItem.findByIdAndDelete(singleItem._id);
        if (halfFullItem) await MenuItem.findByIdAndDelete(halfFullItem._id);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('Zod Validation for Pricing Types', () => {
        test('createMenuItemSchema accepts valid single price', async () => {
            const result = await createMenuItemSchema.safeParseAsync({
                name: 'Paneer Butter Masala',
                description: 'Rich tomato cashew gravy with cottage cheese',
                category: new mongoose.Types.ObjectId().toString(),
                pricingType: 'single',
                price: 240,
            });
            assert.equal(result.success, true);
            assert.equal(result.data.pricingType, 'single');
            assert.equal(result.data.price, 240);
        });

        test('createMenuItemSchema rejects single pricing without price', async () => {
            const result = await createMenuItemSchema.safeParseAsync({
                name: 'Paneer Butter Masala',
                description: 'Rich tomato cashew gravy with cottage cheese',
                category: new mongoose.Types.ObjectId().toString(),
                pricingType: 'single',
            });
            assert.equal(result.success, false);
            assert.ok(result.error.issues.some((i) => i.path.includes('price')));
        });

        test('createMenuItemSchema accepts valid half-full pricing', async () => {
            const result = await createMenuItemSchema.safeParseAsync({
                name: 'Kadai Chicken',
                description: 'Wok tossed spicy chicken with bell peppers',
                category: new mongoose.Types.ObjectId().toString(),
                pricingType: 'half-full',
                halfPrice: 150,
                fullPrice: 280,
            });
            assert.equal(result.success, true);
            assert.equal(result.data.pricingType, 'half-full');
            assert.equal(result.data.halfPrice, 150);
            assert.equal(result.data.fullPrice, 280);
        });

        test('createMenuItemSchema rejects half-full pricing without halfPrice or fullPrice', async () => {
            const missingHalf = await createMenuItemSchema.safeParseAsync({
                name: 'Kadai Chicken',
                description: 'Wok tossed spicy chicken with bell peppers',
                category: new mongoose.Types.ObjectId().toString(),
                pricingType: 'half-full',
                fullPrice: 280,
            });
            assert.equal(missingHalf.success, false);
            assert.ok(missingHalf.error.issues.some((i) => i.path.includes('halfPrice')));

            const missingFull = await createMenuItemSchema.safeParseAsync({
                name: 'Kadai Chicken',
                description: 'Wok tossed spicy chicken with bell peppers',
                category: new mongoose.Types.ObjectId().toString(),
                pricingType: 'half-full',
                halfPrice: 150,
            });
            assert.equal(missingFull.success, false);
            assert.ok(missingFull.error.issues.some((i) => i.path.includes('fullPrice')));
        });

        test('updateMenuItemSchema validates half and full prices when provided', async () => {
            const valid = await updateMenuItemSchema.safeParseAsync({
                pricingType: 'half-full',
                halfPrice: 160,
                fullPrice: 300,
            });
            assert.equal(valid.success, true);
        });
    });

    describe('Order Placement & Variant Pricing Security', () => {
        const dummyCustomer = new mongoose.Types.ObjectId();
        const baseAddress = {
            firstName: 'Rahul',
            lastName: 'Verma',
            phone: '9876543210',
            email: 'rahul@example.com',
            address: 'Civil Lines, Ayodhya',
        };

        test('calculates correct total and snapshot for single-price item', async () => {
            const orderData = {
                items: [
                    { menuItem: singleItem._id.toString(), variant: 'single', quantity: 2 },
                ],
                deliveryAddress: baseAddress,
                orderType: 'delivery',
                paymentMethod: 'cod',
            };

            const order = await orderService.createOrder(dummyCustomer, orderData);
            assert.equal(order.items.length, 1);
            assert.equal(order.items[0].variant, 'single');
            assert.equal(order.items[0].unitPrice, 180);
            assert.equal(order.items[0].price, 180);
            assert.equal(order.items[0].quantity, 2);
            assert.equal(order.items[0].subtotal, 360);
            assert.equal(order.subtotal, 360);

            // Cleanup
            await order.deleteOne();
        });

        test('calculates correct total for half-full item with half and full variants', async () => {
            const orderData = {
                items: [
                    { menuItem: halfFullItem._id.toString(), variant: 'half', quantity: 1 },
                    { menuItem: halfFullItem._id.toString(), variant: 'full', quantity: 2 },
                ],
                deliveryAddress: baseAddress,
                orderType: 'delivery',
                paymentMethod: 'cod',
            };

            const order = await orderService.createOrder(dummyCustomer, orderData);
            assert.equal(order.items.length, 2);

            const halfSnapshot = order.items.find((it) => it.variant === 'half');
            const fullSnapshot = order.items.find((it) => it.variant === 'full');

            assert.ok(halfSnapshot);
            assert.equal(halfSnapshot.unitPrice, 120);
            assert.equal(halfSnapshot.quantity, 1);
            assert.equal(halfSnapshot.subtotal, 120);

            assert.ok(fullSnapshot);
            assert.equal(fullSnapshot.unitPrice, 220);
            assert.equal(fullSnapshot.quantity, 2);
            assert.equal(fullSnapshot.subtotal, 440);

            // Total subtotal = 120 + 440 = 560
            assert.equal(order.subtotal, 560);

            // Cleanup
            await order.deleteOne();
        });

        test('rejects half/full variant on a single-priced item (400 Bad Request)', async () => {
            const orderData = {
                items: [
                    { menuItem: singleItem._id.toString(), variant: 'half', quantity: 1 },
                ],
                deliveryAddress: baseAddress,
                orderType: 'delivery',
                paymentMethod: 'cod',
            };

            await assert.rejects(
                () => orderService.createOrder(dummyCustomer, orderData),
                (err) => {
                    assert.equal(err.statusCode, 400);
                    assert.match(err.message, /only supports single pricing/);
                    return true;
                }
            );
        });

        test('rejects single variant on a half-full item (400 Bad Request)', async () => {
            const orderData = {
                items: [
                    { menuItem: halfFullItem._id.toString(), variant: 'single', quantity: 1 },
                ],
                deliveryAddress: baseAddress,
                orderType: 'delivery',
                paymentMethod: 'cod',
            };

            await assert.rejects(
                () => orderService.createOrder(dummyCustomer, orderData),
                (err) => {
                    assert.equal(err.statusCode, 400);
                    assert.match(err.message, /requires a "half" or "full" variant/);
                    return true;
                }
            );
        });

        test('strictly prevents price tampering by deriving price authoritatively from database', async () => {
            const orderData = {
                items: [
                    // Malicious client attempting to pass a ₹1 price
                    { menuItem: singleItem._id.toString(), variant: 'single', quantity: 1, price: 1, unitPrice: 1 },
                ],
                deliveryAddress: baseAddress,
                orderType: 'delivery',
                paymentMethod: 'cod',
            };

            const order = await orderService.createOrder(dummyCustomer, orderData);
            assert.equal(order.items[0].unitPrice, 180);
            assert.equal(order.items[0].subtotal, 180);
            assert.equal(order.subtotal, 180);

            // Cleanup
            await order.deleteOne();
        });
    });
});
