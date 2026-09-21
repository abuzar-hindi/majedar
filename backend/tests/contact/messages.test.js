import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Message } from '../../src/models/Message.js';
import { Customer } from '../../src/models/Customer.js';
import { Admin } from '../../src/models/Admin.js';
import { createMessageSchema, updateMessageStatusSchema } from '../../src/validators/message.validator.js';
import * as messageService from '../../src/services/message/message.service.js';
import { signToken } from '../../src/utils/token.js';
import { config } from '../../src/config/env.js';

describe('Customer Messages & Support Suite', () => {
    let server;
    let baseUrl;
    let adminToken;
    let adminCookie;
    let customerToken;
    let customerCookie;

    const testAdminId = new mongoose.Types.ObjectId().toString();
    const testCustomerId = new mongoose.Types.ObjectId().toString();

    const mockCustomer = {
        _id: testCustomerId,
        id: testCustomerId,
        name: 'Siddharth Sharma',
        email: 'sid@example.com',
        phone: '9876543210',
        emailVerified: true,
        tokenVersion: 0,
    };

    const makeRequest = async (path, options = {}) => {
        const url = `${baseUrl}${path}`;
        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
        };
        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        }
        const res = await fetch(url, fetchOptions);
        let body;
        try {
            body = await res.json();
        } catch {
            body = null;
        }
        return { status: res.status, body };
    };

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/majedar_test');
        }

        adminToken = signToken({ id: testAdminId, role: 'admin' });
        adminCookie = `${config.cookie.name}=${adminToken}`;

        customerToken = signToken({ id: testCustomerId, type: 'customer', tokenVersion: 0 });
        customerCookie = `${config.customerCookie.name}=${customerToken}`;

        // Mock Admin and Customer lookup
        Admin.findById = async (id) => {
            if (id === testAdminId) return { _id: testAdminId, role: 'admin' };
            return null;
        };

        Customer.findById = async (id) => {
            if (id === testCustomerId) return mockCustomer;
            return null;
        };

        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        await Message.deleteMany({ customer: testCustomerId });
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('Validation', () => {
        test('createMessageSchema validates valid message content and type', async () => {
            const result = await createMessageSchema.safeParseAsync({
                type: 'complaint',
                message: 'Food delivery was delayed by 30 minutes yesterday.',
            });
            assert.equal(result.success, true);
            assert.equal(result.data.type, 'complaint');
            assert.equal(result.data.message, 'Food delivery was delayed by 30 minutes yesterday.');
        });

        test('createMessageSchema rejects message shorter than 5 characters', async () => {
            const result = await createMessageSchema.safeParseAsync({
                type: 'suggestion',
                message: 'Hi',
            });
            assert.equal(result.success, false);
            assert.ok(result.error.issues.some((i) => i.message.includes('at least 5 characters')));
        });

        test('createMessageSchema rejects message longer than 2000 characters', async () => {
            const longMessage = 'A'.repeat(2001);
            const result = await createMessageSchema.safeParseAsync({
                type: 'query',
                message: longMessage,
            });
            assert.equal(result.success, false);
            assert.ok(result.error.issues.some((i) => i.message.includes('cannot exceed 2000 characters')));
        });

        test('createMessageSchema rejects invalid type', async () => {
            const result = await createMessageSchema.safeParseAsync({
                type: 'invalid-type',
                message: 'This is a test message.',
            });
            assert.equal(result.success, false);
            assert.ok(result.error.issues.some((i) => i.message.includes('Type must be one of')));
        });

        test('createMessageSchema strips untrusted client-supplied identity fields', async () => {
            const result = await createMessageSchema.safeParseAsync({
                type: 'suggestion',
                message: 'Please add mocktails to the menu.',
                customer: 'fake-id',
                name: 'Hacker',
                email: 'hacker@evil.com',
                phone: '1234567890',
            });
            assert.equal(result.success, true);
            assert.equal(result.data.customer, undefined, 'Client customer field must be stripped');
            assert.equal(result.data.name, undefined, 'Client name field must be stripped');
            assert.equal(result.data.email, undefined, 'Client email field must be stripped');
        });
    });

    describe('Service Logic & Anti-Spam', () => {
        test('createMessage requires authenticated customer and auto-fills customer details', async () => {
            const created = await messageService.createMessage({
                customer: mockCustomer,
                type: 'query',
                message: 'Is table reservation available for 10 people tonight?',
            });

            assert.equal(created.status, 'new');
            assert.equal(created.customer.toString(), testCustomerId);
            assert.equal(created.name, 'Siddharth Sharma');
            assert.equal(created.email, 'sid@example.com');
            assert.equal(created.phone, '9876543210');

            // Attempting to submit identical message within 60s should trigger duplicate rejection
            await assert.rejects(
                () =>
                    messageService.createMessage({
                        customer: mockCustomer,
                        type: 'query',
                        message: 'Is table reservation available for 10 people tonight?',
                    }),
                (err) => {
                    assert.equal(err.statusCode, 400);
                    assert.match(err.message, /already received this message/);
                    return true;
                }
            );

            // Cleanup
            await created.deleteOne();
        });

        test('createMessage rejects when customer is missing', async () => {
            await assert.rejects(
                () =>
                    messageService.createMessage({
                        customer: null,
                        type: 'complaint',
                        message: 'Missing customer test.',
                    }),
                (err) => {
                    assert.equal(err.statusCode, 401);
                    return true;
                }
            );
        });
    });

    describe('HTTP Endpoints & Access Control', () => {
        test('POST /api/contact rejects unauthenticated requests with 401 Unauthorized', async () => {
            const res = await makeRequest('/api/contact', {
                method: 'POST',
                body: {
                    type: 'suggestion',
                    message: 'Great food, please add mocktails!',
                },
            });

            assert.equal(res.status, 401);
            assert.equal(res.body.success, false);
        });

        test('POST /api/contact submits a new message for authenticated customer (201 Created)', async () => {
            const res = await makeRequest('/api/contact', {
                method: 'POST',
                headers: { Cookie: customerCookie },
                body: {
                    type: 'suggestion',
                    message: 'Love the authentic biryani, please add fresh gulab jamun!',
                    // Untrusted fields should be ignored:
                    name: 'Fake Name',
                    email: 'fake@fake.com',
                },
            });

            assert.equal(res.status, 201);
            assert.equal(res.body.success, true);
            assert.equal(res.body.data.type, 'suggestion');
            assert.equal(res.body.data.customer, testCustomerId);
            assert.equal(res.body.data.name, 'Siddharth Sharma');
            assert.equal(res.body.data.email, 'sid@example.com');

            // Cleanup
            await Message.findByIdAndDelete(res.body.data._id);
        });

        test('GET /api/admin/messages rejects unauthenticated requests (401 Unauthorized)', async () => {
            const res = await makeRequest('/api/admin/messages');
            assert.equal(res.status, 401);
        });

        test('GET /api/admin/messages returns messages and updates status for authenticated admin (200 OK)', async () => {
            // Create a test message in DB
            const testMsg = await Message.create({
                customer: testCustomerId,
                name: 'Siddharth Sharma',
                email: 'sid@example.com',
                phone: '9876543210',
                type: 'query',
                message: 'Need catering service for office party next week.',
                status: 'new',
            });

            // List messages
            const res = await makeRequest('/api/admin/messages', {
                headers: { Cookie: adminCookie },
            });

            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));

            // Test unread count
            const countRes = await makeRequest('/api/admin/messages/unread-count', {
                headers: { Cookie: adminCookie },
            });
            assert.equal(countRes.status, 200);
            assert.ok(typeof countRes.body.data.count === 'number');

            // Test status update to read
            const patchRes = await makeRequest(`/api/admin/messages/${testMsg._id}/status`, {
                method: 'PATCH',
                headers: { Cookie: adminCookie },
                body: { status: 'read' },
            });
            assert.equal(patchRes.status, 200);
            assert.equal(patchRes.body.data.status, 'read');

            // Test status update to resolved
            const resolveRes = await makeRequest(`/api/admin/messages/${testMsg._id}/status`, {
                method: 'PATCH',
                headers: { Cookie: adminCookie },
                body: { status: 'resolved' },
            });
            assert.equal(resolveRes.status, 200);
            assert.equal(resolveRes.body.data.status, 'resolved');

            // Cleanup
            await testMsg.deleteOne();
        });
    });
});
