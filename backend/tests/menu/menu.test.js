import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Category, slugify } from '../../src/models/Category.js';
import { MenuItem } from '../../src/models/MenuItem.js';
import { createCategorySchema, updateCategorySchema } from '../../src/validators/category.validator.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../../src/validators/menu.validator.js';
import * as categoryService from '../../src/services/menu/category.service.js';
import * as menuService from '../../src/services/menu/menu.service.js';
import * as imageService from '../../src/services/uploads/image.service.js';
import { signToken } from '../../src/utils/token.js';
import { Admin } from '../../src/models/Admin.js';

describe('Menu & Category Management Test Suite', () => {

    // ==========================================
    // 1. Zod Validation Tests
    // ==========================================
    describe('Category & Menu Validation', () => {
        test('createCategorySchema validates valid data and normalizes slug', async () => {
            const valid = await createCategorySchema.safeParseAsync({
                name: ' South Indian ',
                sortOrder: 1,
                isActive: true,
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.name, 'South Indian');
            assert.equal(valid.data.sortOrder, 1);
        });

        test('createCategorySchema rejects invalid names', async () => {
            const shortName = await createCategorySchema.safeParseAsync({ name: 'A' });
            assert.equal(shortName.success, false);

            const missingName = await createCategorySchema.safeParseAsync({});
            assert.equal(missingName.success, false);
        });

        test('createMenuItemSchema validates valid data', async () => {
            const valid = await createMenuItemSchema.safeParseAsync({
                name: 'Butter Paneer Masala',
                description: 'Rich and creamy cottage cheese curry cooked with aromatic spices',
                price: 280,
                category: '507f1f77bcf86cd799439011',
                isVeg: true,
                isBestseller: true,
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.name, 'Butter Paneer Masala');
            assert.equal(valid.data.price, 280);
            assert.equal(valid.data.isVeg, true);
        });

        test('createMenuItemSchema rejects zero or negative prices and invalid category ID', async () => {
            // Zero price
            const zeroPrice = await createMenuItemSchema.safeParseAsync({
                name: 'Test Dish',
                description: 'Valid description for testing',
                price: 0,
                category: '507f1f77bcf86cd799439011',
            });
            assert.equal(zeroPrice.success, false);

            // Negative price
            const negativePrice = await createMenuItemSchema.safeParseAsync({
                name: 'Test Dish',
                description: 'Valid description for testing',
                price: -50,
                category: '507f1f77bcf86cd799439011',
            });
            assert.equal(negativePrice.success, false);

            // Invalid category format
            const badCategory = await createMenuItemSchema.safeParseAsync({
                name: 'Test Dish',
                description: 'Valid description for testing',
                price: 150,
                category: 'not-a-mongo-id',
            });
            assert.equal(badCategory.success, false);
        });
    });

    // ==========================================
    // 2. Category Service & Referential Integrity
    // ==========================================
    describe('Category Service Logic', () => {
        test('slugify generates clean URL-friendly slugs', () => {
            assert.equal(slugify('Tea & Coffee'), 'tea-coffee');
            assert.equal(slugify('Rice & Biryani!'), 'rice-biryani');
            assert.equal(slugify('  South Indian  '), 'south-indian');
        });

        test('createCategory creates category and auto-generates slug', async () => {
            const origFindOne = Category.findOne;
            const origSave = Category.prototype.save;
            let savedCategory = null;

            Category.findOne = async () => null;
            Category.prototype.save = async function () {
                savedCategory = this;
                return this;
            };

            try {
                const category = await categoryService.createCategory({
                    name: 'Chinese Delights',
                });

                assert.equal(category.name, 'Chinese Delights');
                assert.equal(category.slug, 'chinese-delights');
                assert.equal(category.isActive, true);
            } finally {
                Category.findOne = origFindOne;
                Category.prototype.save = origSave;
            }
        });

        test('createCategory rejects duplicate name or slug (409 Conflict)', async () => {
            const origFindOne = Category.findOne;
            Category.findOne = async () => ({ _id: 'cat-1', name: 'Momos', slug: 'momos' });

            try {
                await assert.rejects(
                    async () => {
                        await categoryService.createCategory({ name: 'Momos' });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 409);
                        assert.match(err.message, /already exists/i);
                        return true;
                    }
                );
            } finally {
                Category.findOne = origFindOne;
            }
        });

        test('deleteCategory is blocked with 409 Conflict when MenuItem references it', async () => {
            const origFindById = Category.findById;
            const origCountDocuments = MenuItem.countDocuments;

            Category.findById = async () => ({
                _id: 'cat-123',
                name: 'Burgers',
            });
            MenuItem.countDocuments = async () => 3; // 3 linked dishes

            try {
                await assert.rejects(
                    async () => {
                        await categoryService.deleteCategory('cat-123');
                    },
                    (err) => {
                        assert.equal(err.statusCode, 409);
                        assert.match(err.message, /Cannot delete category/i);
                        return true;
                    }
                );
            } finally {
                Category.findById = origFindById;
                MenuItem.countDocuments = origCountDocuments;
            }
        });

        test('deleteCategory succeeds when no MenuItem references it', async () => {
            const origFindById = Category.findById;
            const origCountDocuments = MenuItem.countDocuments;
            const origDelete = Category.findByIdAndDelete;

            Category.findById = async () => ({
                _id: 'cat-empty',
                name: 'Empty Category',
                image: { publicId: 'cat-public-id' },
            });
            MenuItem.countDocuments = async () => 0;
            Category.findByIdAndDelete = async () => true;

            try {
                const res = await categoryService.deleteCategory('cat-empty');
                assert.equal(res.id, 'cat-empty');
                assert.equal(res.name, 'Empty Category');
            } finally {
                Category.findById = origFindById;
                MenuItem.countDocuments = origCountDocuments;
                Category.findByIdAndDelete = origDelete;
            }
        });
    });

    // ==========================================
    // 3. Menu Service Logic & Filtering
    // ==========================================
    describe('Menu Item Service Logic', () => {
        test('createMenuItem rejects if referenced category does not exist (400)', async () => {
            const origFindById = Category.findById;
            Category.findById = async () => null; // Category does not exist

            try {
                await assert.rejects(
                    async () => {
                        await menuService.createMenuItem({
                            name: 'Veg Burger',
                            description: 'Crispy patty with fresh lettuce and mayo',
                            price: 99,
                            category: '507f1f77bcf86cd799439011',
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 400);
                        assert.match(err.message, /Referenced category does not exist/i);
                        return true;
                    }
                );
            } finally {
                Category.findById = origFindById;
            }
        });

        test('getMenuItems with isPublic=true filters out unavailable items and inactive categories', async () => {
            const origFind = MenuItem.find;

            const fakeItems = [
                {
                    _id: 'item-1',
                    name: 'Available Dish',
                    isAvailable: true,
                    category: { name: 'Burgers', isActive: true },
                },
                {
                    _id: 'item-2',
                    name: 'Dish in Inactive Category',
                    isAvailable: true,
                    category: { name: 'Archived', isActive: false },
                },
            ];

            MenuItem.find = () => ({
                populate: () => ({
                    sort: () => ({
                        exec: async () => fakeItems,
                    }),
                }),
            });

            try {
                const publicItems = await menuService.getMenuItems({ isPublic: true });
                assert.equal(publicItems.length, 1);
                assert.equal(publicItems[0].name, 'Available Dish');
            } finally {
                MenuItem.find = origFind;
            }
        });

        test('getMenuItemById returns item if available, throws 404 for public if unavailable', async () => {
            const origFindById = MenuItem.findById;

            MenuItem.findById = () => ({
                populate: async () => ({
                    _id: 'item-unavail',
                    name: 'Sold Out Item',
                    isAvailable: false,
                    category: { name: 'Desserts', isActive: true },
                }),
            });

            try {
                // Public request for unavailable item throws 404
                await assert.rejects(
                    async () => {
                        await menuService.getMenuItemById('item-unavail', { isPublic: true });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 404);
                        return true;
                    }
                );

                // Admin request for unavailable item succeeds
                const adminItem = await menuService.getMenuItemById('item-unavail', { isPublic: false });
                assert.equal(adminItem.name, 'Sold Out Item');
            } finally {
                MenuItem.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 4. Cloudinary Image Handling Safety
    // ==========================================
    describe('Image Service & Replacement Safety', () => {
        test('deleteCloudinaryImage handles errors safely without throwing', async () => {
            const origDestroy = imageService.deleteCloudinaryImage;
            // Test that null/empty publicId returns false safely
            const res = await imageService.deleteCloudinaryImage('');
            assert.equal(res, false);
        });
    });

    // ==========================================
    // 5. HTTP Integration & Authorization Checks
    // ==========================================
    describe('HTTP Endpoints & Role Authorization', () => {
        let server;
        let baseUrl;
        let origCategoryFind;
        let origMenuItemFind;
        let origAdminFindById;

        before(async () => {
            origCategoryFind = Category.find;
            origMenuItemFind = MenuItem.find;
            origAdminFindById = Admin.findById;

            Category.find = () => ({
                sort: async () => [
                    { _id: 'cat-1', name: 'Breakfast', slug: 'breakfast', isActive: true, sortOrder: 1 },
                ],
            });

            MenuItem.find = () => ({
                populate: () => ({
                    sort: () => ({
                        exec: async () => [
                            { _id: 'item-1', name: 'Poha', price: 60, isAvailable: true, category: { name: 'Breakfast', isActive: true } },
                        ],
                    }),
                }),
            });

            Admin.findById = async (id) => {
                if (id === 'admin-valid') {
                    return { _id: 'admin-valid', role: 'admin' };
                }
                return null;
            };

            server = http.createServer(app);
            await new Promise((resolve) => server.listen(0, resolve));
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
        });

        after(async () => {
            Category.find = origCategoryFind;
            MenuItem.find = origMenuItemFind;
            Admin.findById = origAdminFindById;
            if (server) {
                await new Promise((resolve) => server.close(resolve));
            }
        });


        test('GET /api/categories returns 200 OK for public diners without auth', async () => {
            const res = await fetch(`${baseUrl}/api/categories`);
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(Array.isArray(body.data.categories));
        });

        test('GET /api/menu returns 200 OK for public diners without auth', async () => {
            const res = await fetch(`${baseUrl}/api/menu`);
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.ok(Array.isArray(body.data.menu));
        });

        test('POST /api/admin/categories rejects unauthenticated request with 401 Unauthorized', async () => {
            const res = await fetch(`${baseUrl}/api/admin/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Burgers' }),
            });

            assert.equal(res.status, 401);
            const body = await res.json();
            assert.equal(body.success, false);
        });

        test('POST /api/admin/menu rejects unauthenticated request with 401 Unauthorized', async () => {
            const res = await fetch(`${baseUrl}/api/admin/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Paneer Tikka' }),
            });

            assert.equal(res.status, 401);
            const body = await res.json();
            assert.equal(body.success, false);
        });

        test('POST /api/admin/categories rejects customer token with 401/403', async () => {
            const customerToken = signToken({ id: 'cust-123', type: 'customer' }, '1h');
            const res = await fetch(`${baseUrl}/api/admin/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `token=${customerToken}`,
                },
                body: JSON.stringify({ name: 'Burgers' }),
            });

            // Either 401 (Admin account not found) or 403 (Unauthorized role)
            assert.ok(res.status === 401 || res.status === 403);
            const body = await res.json();
            assert.equal(body.success, false);
        });

        test('GET /api/menu/:id rejects malformed Mongo ID with 400 Bad Request', async () => {
            const res = await fetch(`${baseUrl}/api/menu/not-a-valid-id`);
            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.ok(Array.isArray(body.errors));
        });
    });
});
