import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';

import app from '../../src/app.js';
import { Customer } from '../../src/models/Customer.js';
import { CustomerOtp } from '../../src/models/CustomerOtp.js';
import { authenticateCustomer } from '../../src/middleware/customer-auth.middleware.js';
import { config } from '../../src/config/env.js';

describe('Customer Email Verification and Password Reset Suite', () => {
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

    // Helper to generate a mock OTP record in-memory
    const createMockOtpRecord = ({
        email = 'user@example.com',
        type = 'email_verification',
        rawOtp = '123456',
        attempts = 0,
        maxAttempts = 5,
        expiresAt = new Date(Date.now() + 10 * 60 * 1000),
        consumedAt = null,
        resendCooldownUntil = new Date(Date.now() + 60 * 1000),
    } = {}) => {
        const salt = bcrypt.genSaltSync(10);
        const otpHash = bcrypt.hashSync(rawOtp, salt);

        const doc = {
            _id: 'otp-doc-123',
            email,
            type,
            otpHash,
            attempts,
            maxAttempts,
            expiresAt,
            consumedAt,
            resendCooldownUntil,
            save: async function () {
                return this;
            },
        };

        return { doc, rawOtp };
    };

    // =========================================================================
    // 1. Signup Verification Flow & No Authenticated Session
    // =========================================================================
    test('1. signup verification: creates unverified customer and does not issue session cookie', async () => {
        let createdCustomer = null;
        let createdOtp = null;

        const origFindOne = Customer.findOne;
        const origSave = Customer.prototype.save;
        const origOtpFindOne = CustomerOtp.findOne;
        const origOtpDeleteMany = CustomerOtp.deleteMany;
        const origOtpSave = CustomerOtp.prototype.save;

        Customer.findOne = async () => null;
        Customer.prototype.save = async function () {
            createdCustomer = this;
            this._id = 'new-cust-123';
            return this;
        };

        CustomerOtp.findOne = () => ({
            sort: async () => null,
        });
        CustomerOtp.deleteMany = async () => ({ deletedCount: 0 });
        CustomerOtp.prototype.save = async function () {
            createdOtp = this;
            return this;
        };

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Test Customer',
                    email: 'test.signup@example.com',
                    phone: '9876543210',
                    password: 'SecurePassword123!',
                }),
            });

            assert.equal(res.status, 201);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(body.data.requiresVerification, true);
            assert.equal(body.data.customer.emailVerified, false);

            // Verify no auth cookie is attached in Set-Cookie header
            const setCookie = res.headers.get('set-cookie');
            assert.equal(
                setCookie,
                null,
                'Customer must not receive authenticated session cookie before verification'
            );

            // Verify OTP record created
            assert.ok(createdOtp);
            assert.equal(createdOtp.email, 'test.signup@example.com');
            assert.equal(createdOtp.type, 'email_verification');
            assert.equal(createdOtp.attempts, 0);
            assert.ok(createdOtp.otpHash);
        } finally {
            Customer.findOne = origFindOne;
            Customer.prototype.save = origSave;
            CustomerOtp.findOne = origOtpFindOne;
            CustomerOtp.deleteMany = origOtpDeleteMany;
            CustomerOtp.prototype.save = origOtpSave;
        }
    });

    // =========================================================================
    // 2. Wrong OTP
    // =========================================================================
    test('2. wrong OTP: rejected with 400 and increments failed attempts', async () => {
        const { doc } = createMockOtpRecord({ rawOtp: '888888', attempts: 0 });
        const origFindOne = CustomerOtp.findOne;

        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => doc,
            }),
        });

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    otp: '000000', // incorrect OTP
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /invalid or expired/i);
            assert.equal(doc.attempts, 1, 'Attempts counter should increment on failure');
        } finally {
            CustomerOtp.findOne = origFindOne;
        }
    });

    // =========================================================================
    // 3. Expired OTP
    // =========================================================================
    test('3. expired OTP: rejected with 400 when OTP timestamp has expired', async () => {
        // Expired 5 minutes ago
        const pastExpiry = new Date(Date.now() - 5 * 60 * 1000);
        const { doc } = createMockOtpRecord({
            rawOtp: '123456',
            expiresAt: pastExpiry,
        });

        const origFindOne = CustomerOtp.findOne;
        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => doc,
            }),
        });

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    otp: '123456',
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /invalid or expired/i);
        } finally {
            CustomerOtp.findOne = origFindOne;
        }
    });

    // =========================================================================
    // 4. Maximum Attempts
    // =========================================================================
    test('4. maximum attempts: locks OTP once 5 failed attempts are reached', async () => {
        const { doc } = createMockOtpRecord({
            rawOtp: '654321',
            attempts: 4, // 1 remaining before lock
            maxAttempts: 5,
        });

        const origFindOne = CustomerOtp.findOne;
        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => doc,
            }),
        });

        try {
            // Attempt 5 (last allowed attempt, but fails with wrong OTP)
            const res = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    otp: '111111',
                }),
            });

            assert.equal(res.status, 400);
            assert.equal(doc.attempts, 5);
            assert.ok(doc.consumedAt !== null, 'OTP should be marked consumed/locked after max attempts');

            // Subsequent attempt is permanently blocked
            const resLocked = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    otp: '654321', // even if right OTP
                }),
            });

            assert.equal(resLocked.status, 400);
            const lockedBody = await resLocked.json();
            assert.match(lockedBody.message, /maximum.*attempts/i);
        } finally {
            CustomerOtp.findOne = origFindOne;
        }
    });

    // =========================================================================
    // 5. Resend Cooldown
    // =========================================================================
    test('5. resend cooldown: returns 429 when requesting new OTP before 60s cooldown expires', async () => {
        const origFindOneCust = Customer.findOne;
        const origFindOneOtp = CustomerOtp.findOne;

        Customer.findOne = async () => ({
            _id: 'cust-1',
            name: 'User',
            email: 'user@example.com',
            emailVerified: false,
        });

        // Cooldown active for next 45 seconds
        CustomerOtp.findOne = () => ({
            sort: async () => ({
                resendCooldownUntil: new Date(Date.now() + 45 * 1000),
            }),
        });

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    type: 'email_verification',
                }),
            });

            assert.equal(res.status, 429);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /wait.*seconds/i);
        } finally {
            Customer.findOne = origFindOneCust;
            CustomerOtp.findOne = origFindOneOtp;
        }
    });

    // =========================================================================
    // 6. Successful Verification
    // =========================================================================
    test('6. successful verification: marks emailVerified=true, consumes OTP, sets auth cookie', async () => {
        const { doc, rawOtp } = createMockOtpRecord({
            email: 'verified.user@example.com',
            rawOtp: '765432',
        });

        let mockCustomer = {
            _id: 'cust-verified-1',
            name: 'Verified User',
            email: 'verified.user@example.com',
            emailVerified: false,
            tokenVersion: 0,
            toJSON() {
                return {
                    _id: this._id,
                    name: this.name,
                    email: this.email,
                    emailVerified: this.emailVerified,
                };
            },
            save: async function () {
                return this;
            },
        };

        const origFindOneOtp = CustomerOtp.findOne;
        const origFindOneCust = Customer.findOne;

        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => doc,
            }),
        });
        Customer.findOne = async () => mockCustomer;

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'verified.user@example.com',
                    otp: rawOtp,
                }),
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.equal(mockCustomer.emailVerified, true);
            assert.ok(doc.consumedAt !== null, 'OTP must be marked consumed');

            // Verify HttpOnly auth cookie is set
            const setCookie = res.headers.get('set-cookie');
            assert.ok(setCookie);
            assert.match(setCookie, /customer_token=/);
            assert.match(setCookie, /HttpOnly/i);
        } finally {
            CustomerOtp.findOne = origFindOneOtp;
            Customer.findOne = origFindOneCust;
        }
    });

    // =========================================================================
    // 7. OTP Reuse
    // =========================================================================
    test('7. OTP reuse: already consumed OTP is rejected', async () => {
        // Already consumed
        const { doc } = createMockOtpRecord({
            rawOtp: '123456',
            consumedAt: new Date(),
        });

        const origFindOne = CustomerOtp.findOne;
        // findOne query looks for { consumedAt: null }, so consumed OTP returns null
        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => null,
            }),
        });

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    otp: '123456',
                }),
            });

            assert.equal(res.status, 400);
            const body = await res.json();
            assert.equal(body.success, false);
            assert.match(body.message, /invalid or expired/i);
        } finally {
            CustomerOtp.findOne = origFindOne;
        }
    });

    // =========================================================================
    // 8. Forgot Password
    // =========================================================================
    test('8. forgot password: generates reset OTP and returns generic success message', async () => {
        let savedOtp = null;

        const origFindOneCust = Customer.findOne;
        const origFindOneOtp = CustomerOtp.findOne;
        const origDeleteMany = CustomerOtp.deleteMany;
        const origSaveOtp = CustomerOtp.prototype.save;

        Customer.findOne = async () => ({
            _id: 'cust-reset-1',
            name: 'Reset User',
            email: 'reset.user@example.com',
        });

        CustomerOtp.findOne = () => ({
            sort: async () => null,
        });
        CustomerOtp.deleteMany = async () => ({ deletedCount: 0 });
        CustomerOtp.prototype.save = async function () {
            savedOtp = this;
            return this;
        };

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'reset.user@example.com',
                }),
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.match(body.message, /if an account with that email exists/i);

            assert.ok(savedOtp);
            assert.equal(savedOtp.type, 'password_reset');
            assert.equal(savedOtp.email, 'reset.user@example.com');
            assert.ok(savedOtp.otpHash);
        } finally {
            Customer.findOne = origFindOneCust;
            CustomerOtp.findOne = origFindOneOtp;
            CustomerOtp.deleteMany = origDeleteMany;
            CustomerOtp.prototype.save = origSaveOtp;
        }
    });

    // =========================================================================
    // 9. Account Enumeration Protection
    // =========================================================================
    test('9. account enumeration protection: non-existent email returns identical generic response', async () => {
        const origFindOne = Customer.findOne;
        Customer.findOne = async () => null; // Non-existent user

        try {
            const res = await fetch(`${baseUrl}/api/customer-auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nobody-nowhere@example.com',
                }),
            });

            assert.equal(res.status, 200);
            const body = await res.json();
            assert.equal(body.success, true);
            assert.match(body.message, /if an account with that email exists/i);

            // Resend OTP also returns generic response for non-existent email
            const resResend = await fetch(`${baseUrl}/api/customer-auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nobody-nowhere@example.com',
                }),
            });

            assert.equal(resResend.status, 200);
            const resendBody = await resResend.json();
            assert.equal(resendBody.success, true);
            assert.match(resendBody.message, /if the account exists/i);
        } finally {
            Customer.findOne = origFindOne;
        }
    });

    // =========================================================================
    // 10, 11 & 12. Reset Password, Invalid OTP, Password Hashing
    // =========================================================================
    test('10, 11, 12. reset password: wrong OTP fails; valid OTP updates bcrypt passwordHash', async () => {
        const { doc, rawOtp } = createMockOtpRecord({
            email: 'change.pw@example.com',
            type: 'password_reset',
            rawOtp: '998877',
        });

        let updatedCustomer = {
            _id: 'cust-pw-1',
            email: 'change.pw@example.com',
            passwordHash: await bcrypt.hash('OldPassword123!', 10),
            tokenVersion: 1,
            save: async function () {
                return this;
            },
        };

        const origFindOneOtp = CustomerOtp.findOne;
        const origFindOneCust = Customer.findOne;

        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => doc,
            }),
        });
        Customer.findOne = async () => updatedCustomer;

        try {
            // 11. Invalid reset OTP
            const failRes = await fetch(`${baseUrl}/api/customer-auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'change.pw@example.com',
                    otp: '000000',
                    newPassword: 'BrandNewPassword123!',
                }),
            });

            assert.equal(failRes.status, 400);

            // 10 & 12. Valid reset OTP & password hashing
            const successRes = await fetch(`${baseUrl}/api/customer-auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'change.pw@example.com',
                    otp: rawOtp,
                    newPassword: 'BrandNewPassword123!',
                }),
            });

            assert.equal(successRes.status, 200);
            const body = await successRes.json();
            assert.equal(body.success, true);
            assert.match(body.message, /password has been reset successfully/i);

            // 12. Verify password is saved as bcrypt hash and never plaintext
            assert.notEqual(updatedCustomer.passwordHash, 'BrandNewPassword123!');
            const isMatch = await bcrypt.compare('BrandNewPassword123!', updatedCustomer.passwordHash);
            assert.equal(isMatch, true, 'New password must match stored bcrypt hash');

            // 13. Verify tokenVersion incremented to invalidate sessions
            assert.equal(updatedCustomer.tokenVersion, 2);
        } finally {
            CustomerOtp.findOne = origFindOneOtp;
            Customer.findOne = origFindOneCust;
        }
    });

    // =========================================================================
    // 13. Session Invalidation
    // =========================================================================
    test('13. session invalidation: old tokens rejected after tokenVersion increments', async () => {
        // Token signed with tokenVersion: 1
        const oldToken = signToken({ id: 'cust-session-1', type: 'customer', tokenVersion: 1 });

        // Database customer now has tokenVersion: 2 (e.g. after password reset)
        const origFindById = Customer.findById;
        Customer.findById = async () => ({
            _id: 'cust-session-1',
            email: 'session@example.com',
            tokenVersion: 2,
            emailVerified: true,
        });

        const req = {
            cookies: {
                [config.customerCookie.name]: oldToken,
            },
        };

        let capturedError = null;
        try {
            await authenticateCustomer(req, {}, (err) => {
                capturedError = err;
            });

            assert.ok(capturedError, 'Old token must be rejected after password reset');
            assert.equal(capturedError.statusCode, 401);
            assert.match(capturedError.message, /invalidated/i);
        } finally {
            Customer.findById = origFindById;
        }
    });

    // =========================================================================
    // 14. Rate Limiting on OTP Endpoints
    // =========================================================================
    test('14. rate limiting: limits excessive OTP requests with 429 Too Many Requests', async () => {
        const origFindOne = CustomerOtp.findOne;
        CustomerOtp.findOne = () => ({
            select: () => ({
                sort: async () => null,
            }),
        });

        let rateLimitedResponse = null;

        try {
            for (let i = 0; i < 20; i++) {
                const res = await fetch(`${baseUrl}/api/customer-auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'rate.limit@example.com',
                        otp: '123456',
                    }),
                });

                if (res.status === 429) {
                    rateLimitedResponse = res;
                    break;
                }
            }

            assert.ok(rateLimitedResponse, 'Excessive verification attempts must be rate limited with 429');
            assert.equal(rateLimitedResponse.status, 429);
            const body = await rateLimitedResponse.json();
            assert.equal(body.success, false);
            assert.match(body.message, /too many/i);
        } finally {
            CustomerOtp.findOne = origFindOne;
        }
    });
});
