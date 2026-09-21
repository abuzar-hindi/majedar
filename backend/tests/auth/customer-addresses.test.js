import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import app from '../../src/app.js';
import { Customer } from '../../src/models/Customer.js';
import { signToken } from '../../src/utils/token.js';
import { config } from '../../src/config/env.js';

describe('Customer Address Book Suite', () => {
    let server;
    let baseUrl;
    let testCustomer;
    let authCookie;

    before(async () => {
        if (!mongoose.connection.readyState) {
            await mongoose.connect(config.mongoUri);
        }

        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;

        // Create a verified test customer
        const passwordHash = await bcrypt.hash('Password@123', 10);
        testCustomer = await Customer.create({
            name: 'Address Test Customer',
            email: `addr_test_${Date.now()}@example.com`,
            phone: '9876543210',
            passwordHash,
            emailVerified: true,
            addresses: [],
        });

        const token = signToken({
            id: testCustomer._id,
            type: 'customer',
            tokenVersion: testCustomer.tokenVersion || 0,
        });
        authCookie = `customer_token=${token}`;
    });

    after(async () => {
        if (testCustomer?._id) {
            await Customer.deleteOne({ _id: testCustomer._id });
        }
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    test('1. POST /api/v1/customer-auth/addresses adds a new address without customerAuthService reference error', async () => {
        const payload = {
            label: 'Home',
            firstName: 'Test',
            lastName: 'Customer',
            phone: '9876543210',
            address: '123 Civil Lines',
            area: 'Civil Lines',
            landmark: 'Near Clock Tower',
            isDefault: true,
        };

        const res = await fetch(`${baseUrl}/api/customer-auth/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: authCookie,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        assert.equal(res.status, 201, `Expected 201 Created, got ${res.status}: ${JSON.stringify(data)}`);
        assert.equal(data.success, true);
        assert.ok(Array.isArray(data.data.addresses));
        assert.equal(data.data.addresses.length, 1);
        assert.equal(data.data.addresses[0].address, '123 Civil Lines');
        assert.equal(data.data.addresses[0].isDefault, true);
    });

    test('2. GET /api/v1/customer-auth/addresses retrieves the customer address book', async () => {
        const res = await fetch(`${baseUrl}/api/customer-auth/addresses`, {
            headers: {
                Cookie: authCookie,
            },
        });

        const data = await res.json();
        assert.equal(res.status, 200);
        assert.equal(data.success, true);
        assert.ok(Array.isArray(data.data.addresses));
        assert.equal(data.data.addresses.length, 1);
    });

    test('3. POST /api/v1/customer-auth/addresses adds second address and setting default works', async () => {
        const payload2 = {
            label: 'Office',
            firstName: 'Test',
            lastName: 'Customer',
            phone: '9876543210',
            address: '456 Commercial Hub',
            area: 'Commercial Hub',
            isDefault: false,
        };

        const res2 = await fetch(`${baseUrl}/api/customer-auth/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: authCookie,
            },
            body: JSON.stringify(payload2),
        });

        const data2 = await res2.json();
        assert.equal(res2.status, 201);
        assert.equal(data2.data.addresses.length, 2);

        const officeAddr = data2.data.addresses.find((a) => a.label === 'Office');
        assert.ok(officeAddr);

        // Set office as default
        const resDefault = await fetch(`${baseUrl}/api/customer-auth/addresses/${officeAddr._id}/default`, {
            method: 'PATCH',
            headers: {
                Cookie: authCookie,
            },
        });

        const dataDefault = await resDefault.json();
        assert.equal(resDefault.status, 200);
        const updatedOffice = dataDefault.data.addresses.find((a) => a.label === 'Office');
        assert.equal(updatedOffice.isDefault, true);

        const updatedHome = dataDefault.data.addresses.find((a) => a.label === 'Home');
        assert.equal(updatedHome.isDefault, false);
    });
});
