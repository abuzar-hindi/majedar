import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';

import app from '../../src/app.js';
import { loginAdminSchema } from '../../src/validators/auth.validator.js';
import { signToken, verifyToken } from '../../src/utils/token.js';
import { setAuthCookie, clearAuthCookie } from '../../src/utils/cookie.js';
import { authenticateAdmin } from '../../src/middleware/auth.middleware.js';
import { requireAdmin, authorizeRoles } from '../../src/middleware/admin.middleware.js';
import { Admin } from '../../src/models/Admin.js';
import * as authService from '../../src/services/auth/auth.service.js';

describe('Admin Authentication Test Suite (Single Admin Setup)', () => {

    // ==========================================
    // 1. Zod Validation Tests
    // ==========================================
    describe('Validation Layer', () => {
        test('Login schema validates email and non-empty password, strips extraneous fields', async () => {
            // Valid login
            const valid = await loginAdminSchema.safeParseAsync({
                email: ' ADMIN@Restaurant.com ',
                password: 'anyPassword123',
                extraField: 'shouldBeStripped',
            });
            assert.equal(valid.success, true);
            assert.equal(valid.data.email, 'admin@restaurant.com');
            assert.equal(valid.data.password, 'anyPassword123');
            assert.equal(valid.data.extraField, undefined);

            // Empty password rejected
            const emptyPassword = await loginAdminSchema.safeParseAsync({
                email: 'admin@restaurant.com',
                password: '',
            });
            assert.equal(emptyPassword.success, false);

            // Invalid email rejected
            const invalidEmail = await loginAdminSchema.safeParseAsync({
                email: 'invalid-email',
                password: 'somepassword',
            });
            assert.equal(invalidEmail.success, false);
        });
    });

    // ==========================================
    // 2. Token & Cookie Utility Tests
    // ==========================================
    describe('Token and Cookie Utilities', () => {
        test('signToken generates a valid JWT verifiable by verifyToken', () => {
            const payload = { id: 'admin123', role: 'admin' };
            const token = signToken(payload, '1h');
            assert.equal(typeof token, 'string');

            const decoded = verifyToken(token);
            assert.equal(decoded.id, payload.id);
            assert.equal(decoded.role, payload.role);
        });

        test('verifyToken throws on expired or invalid token', () => {
            const expiredToken = signToken({ id: 'admin123' }, -1);
            assert.throws(() => verifyToken(expiredToken), (err) => {
                return err.name === 'TokenExpiredError';
            });

            assert.throws(() => verifyToken('invalid.token.string'), (err) => {
                return err.name === 'JsonWebTokenError';
            });
        });

        test('setAuthCookie sets HttpOnly cookie with security flags', () => {
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

            setAuthCookie(mockRes, 'test-jwt-token');
            assert.equal(mockRes.cookieName, 'token');
            assert.equal(mockRes.cookieVal, 'test-jwt-token');
            assert.equal(mockRes.cookieOpts.httpOnly, true);
            assert.equal(mockRes.cookieOpts.path, '/');
            assert.ok(mockRes.cookieOpts.maxAge > 0);
        });

        test('clearAuthCookie clears cookie with matching path and flags', () => {
            const mockRes = {
                clearedName: null,
                clearedOpts: null,
                clearCookie(name, opts) {
                    this.clearedName = name;
                    this.clearedOpts = opts;
                },
            };

            clearAuthCookie(mockRes);
            assert.equal(mockRes.clearedName, 'token');
            assert.equal(mockRes.clearedOpts.httpOnly, true);
            assert.equal(mockRes.clearedOpts.path, '/');
        });
    });

    // ==========================================
    // 3. Service Layer & Credentials Checking
    // ==========================================
    describe('Auth Service (Login & Profile)', () => {
        test('loginAdmin rejects non-existent email with generic error', async () => {
            const origFindOne = Admin.findOne;
            Admin.findOne = () => ({
                select: async () => null,
            });

            try {
                await assert.rejects(
                    async () => {
                        await authService.loginAdmin({
                            email: 'unknown@majedar.com',
                            password: 'AnyPassword123!',
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 401);
                        assert.equal(err.message, 'Invalid email or password');
                        return true;
                    }
                );
            } finally {
                Admin.findOne = origFindOne;
            }
        });

        test('loginAdmin rejects incorrect password with identical generic error', async () => {
            const origFindOne = Admin.findOne;
            Admin.findOne = () => ({
                select: async () => ({
                    _id: 'admin123',
                    email: 'admin@majedar.com',
                    role: 'admin',
                    passwordHash: await bcrypt.hash('CorrectPassword123!', 10),
                    comparePassword: async () => false,
                }),
            });

            try {
                await assert.rejects(
                    async () => {
                        await authService.loginAdmin({
                            email: 'admin@majedar.com',
                            password: 'WrongPassword123!',
                        });
                    },
                    (err) => {
                        assert.equal(err.statusCode, 401);
                        assert.equal(err.message, 'Invalid email or password');
                        return true;
                    }
                );
            } finally {
                Admin.findOne = origFindOne;
            }
        });

        test('loginAdmin succeeds with valid credentials and does not expose passwordHash', async () => {
            const origFindOne = Admin.findOne;
            const fakeAdmin = {
                _id: 'admin-id-456',
                name: 'Verified Admin',
                email: 'verified@majedar.com',
                role: 'admin',
                passwordHash: await bcrypt.hash('CorrectPassword123!', 10),
                comparePassword: async () => true,
                toJSON: () => ({
                    _id: 'admin-id-456',
                    name: 'Verified Admin',
                    email: 'verified@majedar.com',
                    role: 'admin',
                }),
            };

            Admin.findOne = () => ({
                select: async () => fakeAdmin,
            });

            try {
                const result = await authService.loginAdmin({
                    email: 'verified@majedar.com',
                    password: 'CorrectPassword123!',
                });

                assert.ok(result.admin);
                assert.equal(result.admin.email, 'verified@majedar.com');
                assert.equal(result.admin.passwordHash, undefined, 'passwordHash must not be exposed');
            } finally {
                Admin.findOne = origFindOne;
            }
        });

        test('getAdminProfile retrieves profile and throws if not found', async () => {
            const origFindById = Admin.findById;
            Admin.findById = async (id) => {
                if (id === 'valid-id') {
                    return {
                        toJSON: () => ({ _id: 'valid-id', name: 'Admin', email: 'admin@majedar.com', role: 'admin' }),
                    };
                }
                return null;
            };

            try {
                const profile = await authService.getAdminProfile('valid-id');
                assert.equal(profile.admin.email, 'admin@majedar.com');

                await assert.rejects(
                    async () => {
                        await authService.getAdminProfile('invalid-id');
                    },
                    (err) => {
                        assert.equal(err.statusCode, 404);
                        return true;
                    }
                );
            } finally {
                Admin.findById = origFindById;
            }
        });
    });

    // ==========================================
    // 4. Authentication & Authorization Middleware Tests
    // ==========================================
    describe('Middleware Security', () => {
        test('authenticateAdmin rejects request without token with 401', async () => {
            const req = { cookies: {} };
            let capturedError = null;

            await authenticateAdmin(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 401);
            assert.match(capturedError.message, /No session token provided/i);
        });

        test('authenticateAdmin rejects expired token with 401', async () => {
            const expiredToken = signToken({ id: 'test' }, -10);
            const req = { cookies: { token: expiredToken } };
            let capturedError = null;

            await authenticateAdmin(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 401);
            assert.match(capturedError.message, /Session expired/i);
        });

        test('authenticateAdmin rejects invalid token with 401', async () => {
            const req = { cookies: { token: 'tampered.jwt.signature' } };
            let capturedError = null;

            await authenticateAdmin(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 401);
            assert.match(capturedError.message, /Invalid authentication token/i);
        });

        test('authenticateAdmin loads active admin from database and attaches to req.admin', async () => {
            const validToken = signToken({ id: 'admin-id-789', role: 'admin' }, '1h');
            const req = { cookies: { token: validToken } };

            const origFindById = Admin.findById;
            Admin.findById = async (id) => {
                if (id === 'admin-id-789') {
                    return { _id: 'admin-id-789', name: 'Super Admin', email: 'super@majedar.com', role: 'admin' };
                }
                return null;
            };

            let capturedError = null;
            let nextCalled = false;
            try {
                await authenticateAdmin(req, {}, (err) => {
                    nextCalled = true;
                    capturedError = err;
                });

                assert.equal(nextCalled, true);
                assert.equal(capturedError, undefined);
                assert.ok(req.admin);
                assert.equal(req.admin._id, 'admin-id-789');
            } finally {
                Admin.findById = origFindById;
            }
        });

        test('requireAdmin allows admin and super-admin roles', () => {
            let passed = false;
            requireAdmin({ admin: { role: 'admin' } }, {}, () => {
                passed = true;
            });
            assert.equal(passed, true);

            passed = false;
            requireAdmin({ admin: { role: 'super-admin' } }, {}, () => {
                passed = true;
            });
            assert.equal(passed, true);
        });

        test('requireAdmin rejects unauthorized roles with 403 Forbidden', () => {
            let capturedError = null;
            requireAdmin({ admin: { role: 'customer' } }, {}, (err) => {
                capturedError = err;
            });
            assert.ok(capturedError);
            assert.equal(capturedError.statusCode, 403);
            assert.match(capturedError.message, /permission/i);
        });
    });

    // ==========================================
    // 5. HTTP Integration & Route Testing
    // ==========================================
    describe('HTTP Endpoints Integration', () => {
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

        test('GET /api/health returns 200 OK', async () => {
            const res = await fetch(`${baseUrl}/api/health`);
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.status, 'ok');
        });

        test('POST /api/auth/signup returns 404 (admin signup removed)', async () => {
            const res = await fetch(`${baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Admin', email: 'admin@majedar.com', password: 'Password123!' }),
            });
            assert.equal(res.status, 404);
        });

        test('POST /api/auth/login with invalid data returns 400 Bad Request with field errors', async () => {
            const res = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: '',
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.ok(Array.isArray(body.errors));
            assert.ok(body.errors.length >= 2);
        });

        test('GET /api/auth/me without cookie returns 401 Unauthorized', async () => {
            const res = await fetch(`${baseUrl}/api/auth/me`);
            assert.equal(res.status, 401);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /Authentication required/i);
        });

        test('POST /api/auth/logout clears cookie and returns 200', async () => {
            const res = await fetch(`${baseUrl}/api/auth/logout`, {
                method: 'POST',
            });

            assert.equal(res.status, 200);
            const setCookie = res.headers.get('set-cookie');
            assert.ok(setCookie, 'set-cookie header should be present to clear cookie');
            assert.match(setCookie, /token=/);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.message, 'Logout successful');
        });

        test('Unmatched endpoint returns 404 with structured error', async () => {
            const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
            assert.equal(res.status, 404);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /Cannot GET/i);
        });
    });
});
