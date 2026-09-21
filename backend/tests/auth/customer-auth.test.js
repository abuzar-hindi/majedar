import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';

import app from '../../src/app.js';
import { customerSignupSchema, customerLoginSchema } from '../../src/validators/customer-auth.validator.js';
import { signToken, verifyToken } from '../../src/utils/token.js';
import { setCustomerAuthCookie, clearCustomerAuthCookie } from '../../src/utils/cookie.js';
import { authenticateCustomer } from '../../src/middleware/customer-auth.middleware.js';
import { Customer } from '../../src/models/Customer.js';
import { CustomerOtp } from '../../src/models/CustomerOtp.js';
import * as customerAuthService from '../../src/services/customer-auth/customer-auth.service.js';
import { config } from '../../src/config/env.js';

describe('Customer Authentication Test Suite', () => {

    // ==========================================
    // 1. Zod Validation Tests
    // ==========================================
    describe('Customer Validation Layer', () => {
        test('Valid signup data passes validation and normalizes email', async () => {
            const input = {
                name: 'Jane Customer',
                email: '  Jane.Customer@Gmail.Com ',
                phone: '+91 9876543210',
                password: 'CustomerPassword123!',
                role: 'admin', // Prohibited / extraneous field
            };

            const result = await customerSignupSchema.safeParseAsync(input);
            assert.equal(result.success, true);
            assert.equal(result.data.email, 'jane.customer@gmail.com');
            assert.equal(result.data.name, 'Jane Customer');
            assert.equal(result.data.phone, '+91 9876543210');
            assert.equal(result.data.role, undefined, 'Role should be stripped from customer input');
        });

        test('Invalid signup data is rejected (short password, bad email, missing phone)', async () => {
            // Short password
            const shortPwd = await customerSignupSchema.safeParseAsync({
                name: 'Jane',
                email: 'jane@example.com',
                phone: '9876543210',
                password: '123',
            });
            assert.equal(shortPwd.success, false);

            // Invalid email
            const badEmail = await customerSignupSchema.safeParseAsync({
                name: 'Jane',
                email: 'invalid-email',
                phone: '9876543210',
                password: 'validPassword123',
            });
            assert.equal(badEmail.success, false);

            // Missing phone
            const missingPhone = await customerSignupSchema.safeParseAsync({
                name: 'Jane',
                email: 'jane@example.com',
                password: 'validPassword123',
            });
            assert.equal(missingPhone.success, false);
        });

        test('Customer login schema validates email and non-empty password', async () => {
            const valid = await customerLoginSchema.safeParseAsync({
                email: ' CUSTOMER@Domain.com ',
                password: 'somePassword',
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.email, 'customer@domain.com');

            const emptyPassword = await customerLoginSchema.safeParseAsync({
                email: 'customer@domain.com',
                password: '',
            });
            assert.equal(emptyPassword.success, false);
        });
    });

    // ==========================================
    // 2. Cookie & Token Behavior
    // ==========================================
    describe('Customer Cookie & Token Utilities', () => {
        test('Customer token includes customer type identifier', () => {
            const token = signToken({ id: 'cust123', type: 'customer' }, '7d');
            const decoded = verifyToken(token);
            assert.equal(decoded.id, 'cust123');
            assert.equal(decoded.type, 'customer');
        });

        test('setCustomerAuthCookie sets HttpOnly customer_token cookie', () => {
            const mockRes = {
                cookieName: null,
                cookieVal: null,
                cookieOpts: null,
                cookie(name, val, opts) {
                    this.cookieName = name;
                    this.cookieVal = val;
                    this.cookieOpts = opts;
                },
            };

            setCustomerAuthCookie(mockRes, 'cust-jwt-token');
            assert.equal(mockRes.cookieName, 'customer_token');
            assert.equal(mockRes.cookieVal, 'cust-jwt-token');
            assert.equal(mockRes.cookieOpts.httpOnly, true);
            assert.equal(mockRes.cookieOpts.path, '/');
            assert.ok(mockRes.cookieOpts.maxAge > 0);
        });

        test('clearCustomerAuthCookie clears customer_token cookie with matching path', () => {
            const mockRes = {
                clearedName: null,
                clearedOpts: null,
                clearCookie(name, opts) {
                    this.clearedName = name;
                    this.clearedOpts = opts;
                },
            };

            clearCustomerAuthCookie(mockRes);
            assert.equal(mockRes.clearedName, 'customer_token');
            assert.equal(mockRes.clearedOpts.httpOnly, true);
            assert.equal(mockRes.clearedOpts.path, '/');
        });
    });

    // ==========================================
    // 3. Service Layer Tests
    // ==========================================
    describe('Customer Auth Service', () => {
        test('signupCustomer hashes password and returns customer without passwordHash', async () => {
            const origFindOne = Customer.findOne;
            const origSave = Customer.prototype.save;
            const origOtpFindOne = CustomerOtp.findOne;
            const origOtpDeleteMany = CustomerOtp.deleteMany;
            const origOtpSave = CustomerOtp.prototype.save;
            let savedDoc = null;

            Customer.findOne = async () => null;
            Customer.prototype.save = async function () {
                savedDoc = this;
                return this;
            };
            CustomerOtp.findOne = () => ({
                sort: async () => null,
            });
            CustomerOtp.deleteMany = async () => ({ deletedCount: 0 });
            CustomerOtp.prototype.save = async function () {
                return this;
            };

            try {
                const result = await customerAuthService.signupCustomer({
                    name: 'Alice Customer',
                    email: ' Alice@Example.Com ',
                    phone: '9876543210',
                    password: 'SecureCustomer123!',
                });

                assert.ok(result.customer);
                assert.equal(result.customer.email, 'alice@example.com');
                assert.equal(result.customer.name, 'Alice Customer');
                assert.equal(result.customer.passwordHash, undefined, 'passwordHash must never be exposed');

                // Check stored password hash
                assert.ok(savedDoc.passwordHash);
                assert.notEqual(savedDoc.passwordHash, 'SecureCustomer123!');
                const isMatch = await bcrypt.compare('SecureCustomer123!', savedDoc.passwordHash);
                assert.equal(isMatch, true);
            } finally {
                Customer.findOne = origFindOne;
                Customer.prototype.save = origSave;
                CustomerOtp.findOne = origOtpFindOne;
                CustomerOtp.deleteMany = origOtpDeleteMany;
                CustomerOtp.prototype.save = origOtpSave;
            }
        });

        test('signupCustomer rejects duplicate email (409 Conflict)', async () => {
            const origFindOne = Customer.findOne;
            Customer.findOne = async () => ({ _id: 'cust-id', email: 'existing@example.com' });

            try {
                await assert.rejects(
                    async () => {
                        await customerAuthService.signupCustomer({
                            name: 'Duplicate Alice',
                            email: 'existing@example.com',
                            phone: '9876543210',
                            password: 'SecureCustomer123!',
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 409);
                        assert.match(err.message, /already exists/i);
                        return true;
                    }
                );
            } finally {
                Customer.findOne = origFindOne;
            }
        });

        test('loginCustomer rejects non-existing email with generic error', async () => {
            const origFindOne = Customer.findOne;
            Customer.findOne = () => ({
                select: async () => null,
            });

            try {
                await assert.rejects(
                    async () => {
                        await customerAuthService.loginCustomer({
                            email: 'nonexistent@example.com',
                            password: 'Password123!',
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 401);
                        assert.equal(err.message, 'Invalid email or password');
                        return true;
                    }
                );
            } finally {
                Customer.findOne = origFindOne;
            }
        });

        test('loginCustomer rejects wrong password with generic error', async () => {
            const origFindOne = Customer.findOne;
            Customer.findOne = () => ({
                select: async () => ({
                    _id: 'cust-123',
                    email: 'alice@example.com',
                    passwordHash: await bcrypt.hash('CorrectPassword123!', 10),
                    comparePassword: async () => false,
                }),
            });

            try {
                await assert.rejects(
                    async () => {
                        await customerAuthService.loginCustomer({
                            email: 'alice@example.com',
                            password: 'WrongPassword!',
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 401);
                        assert.equal(err.message, 'Invalid email or password');
                        return true;
                    }
                );
            } finally {
                Customer.findOne = origFindOne;
            }
        });

        test('loginCustomer succeeds with correct credentials and omits passwordHash', async () => {
            const origFindOne = Customer.findOne;
            Customer.findOne = () => ({
                select: async () => ({
                    _id: 'cust-123',
                    name: 'Alice',
                    email: 'alice@example.com',
                    phone: '9876543210',
                    passwordHash: await bcrypt.hash('CorrectPassword123!', 10),
                    comparePassword: async () => true,
                    toJSON: () => ({
                        _id: 'cust-123',
                        name: 'Alice',
                        email: 'alice@example.com',
                        phone: '9876543210',
                    }),
                }),
            });

            try {
                const result = await customerAuthService.loginCustomer({
                    email: 'alice@example.com',
                    password: 'CorrectPassword123!',
                });

                assert.ok(result.customer);
                assert.equal(result.customer.email, 'alice@example.com');
                assert.equal(result.customer.passwordHash, undefined);
            } finally {
                Customer.findOne = origFindOne;
            }
        });
    });

    // ==========================================
    // 4. Customer Middleware Tests
    // ==========================================
    describe('Customer Auth Middleware', () => {
        test('authenticateCustomer rejects request without customer_token cookie with 401', async () => {
            const req = { cookies: {} };
            let capturedError = null;

            await authenticateCustomer(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 401);
        });

        test('authenticateCustomer rejects expired customer token with 401', async () => {
            const expiredToken = signToken({ id: 'cust-1', type: 'customer' }, -10);
            const req = { cookies: { customer_token: expiredToken } };
            let capturedError = null;

            await authenticateCustomer(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 401);
            assert.match(capturedError.message, /expired/i);
        });

        test('authenticateCustomer rejects admin token (wrong token type)', async () => {
            // Token created without type: 'customer' (e.g. admin token)
            const adminToken = signToken({ id: 'admin-1', role: 'admin', type: 'admin' }, '1h');
            const req = { cookies: { customer_token: adminToken } };
            let capturedError = null;

            await authenticateCustomer(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 401);
            assert.match(capturedError.message, /Invalid customer token/i);
        });

        test('authenticateCustomer loads customer and attaches to req.customer', async () => {
            const validToken = signToken({ id: 'cust-999', type: 'customer' }, '1h');
            const req = { cookies: { customer_token: validToken } };

            const origFindById = Customer.findById;
            Customer.findById = async (id) => {
                if (id === 'cust-999') {
                    return { _id: 'cust-999', name: 'Alice Customer', email: 'alice@example.com' };
                }
                return null;
            };

            let capturedError = null;
            let nextCalled = false;
            try {
                await authenticateCustomer(req, {}, (err) => {
                    nextCalled = true;
                    capturedError = err;
                });

                assert.equal(nextCalled, true);
                assert.equal(capturedError, undefined);
                assert.ok(req.customer);
                assert.equal(req.customer._id, 'cust-999');
            } finally {
                Customer.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 5. HTTP Integration Endpoints
    // ==========================================
    describe('HTTP Endpoints (/api/customer-auth)', () => {
        let server;
        let baseUrl;

        before(async () => {
            server = http.createServer(app);
            await new Promise((resolve) => server.listen(0, resolve));
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
        });

        after(async () => {
            if (server) {
                await new Promise((resolve) => server.close(resolve));
            }
        });

        test('POST /api/customer-auth/signup with invalid data returns 400 Bad Request', async () => {
            const res = await fetch(`${baseUrl}/api/customer-auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: '',
                    email: 'bad-email',
                    phone: '',
                    password: '123',
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.ok(Array.isArray(body.errors));
        });

        test('POST /api/customer-auth/login with invalid data returns 400 Bad Request', async () => {
            const res = await fetch(`${baseUrl}/api/customer-auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'bad-email',
                    password: '',
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.ok(Array.isArray(body.errors));
        });

        test('GET /api/customer-auth/me without cookie returns 401 Unauthorized', async () => {
            const res = await fetch(`${baseUrl}/api/customer-auth/me`);
            assert.equal(res.status, 401);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /Authentication required/i);
        });

        test('POST /api/customer-auth/logout clears customer_token cookie and returns 200', async () => {
            const res = await fetch(`${baseUrl}/api/customer-auth/logout`, {
                method: 'POST',
            });

            assert.equal(res.status, 200);
            const setCookie = res.headers.get('set-cookie');
            assert.ok(setCookie);
            assert.match(setCookie, /customer_token=/);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.message, 'Logout successful');
        });
    });
});
