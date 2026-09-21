import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../../src/config/env.js';
import { CustomerOtp } from '../../src/models/CustomerOtp.js';
import * as customerOtpService from '../../src/services/customer-auth/customer-otp.service.js';

describe('DEV Email Mode & Production Security for Customer OTP', () => {
    test('Development mode: logs OTP, does not block on unverified domain, and returns success', async () => {
        const testEmail = 'dev.customer@majedar.local';
        let loggedOutput = '';

        const origLog = console.log;
        console.log = (...args) => {
            loggedOutput += args.join(' ') + '\n';
        };

        const origIsProduction = config.isProduction;
        config.isProduction = false;

        // Mock DB calls on CustomerOtp
        const origFindOne = CustomerOtp.findOne;
        const origDeleteMany = CustomerOtp.deleteMany;
        const origSave = CustomerOtp.prototype.save;

        CustomerOtp.findOne = () => ({
            sort: async () => null,
        });
        CustomerOtp.deleteMany = async () => ({ deletedCount: 0 });
        CustomerOtp.prototype.save = async function () {
            return this;
        };

        try {
            const result = await customerOtpService.createAndSendCustomerOtp({
                email: testEmail,
                type: 'email_verification',
                name: 'Dev Tester',
            });

            assert.equal(result.success, true, 'Dev mode must return success: true');
            assert.match(
                loggedOutput,
                /\[DEV EMAIL MODE\] CUSTOMER EMAIL VERIFICATION OTP/,
                'Must log clear DEV EMAIL banner'
            );
            assert.match(
                loggedOutput,
                /Recipient:\s*dev\.customer@majedar\.local/,
                'Must log recipient in terminal'
            );
            assert.match(
                loggedOutput,
                /OTP Code:\s*\d{6}/,
                'Must log 6-digit numeric OTP in terminal'
            );
        } finally {
            console.log = origLog;
            config.isProduction = origIsProduction;
            CustomerOtp.findOne = origFindOne;
            CustomerOtp.deleteMany = origDeleteMany;
            CustomerOtp.prototype.save = origSave;
        }
    });

    test('Production mode: rejects if email sending fails and never exposes OTP', async () => {
        const testEmail = 'prod.customer@majedar.com';
        let loggedOutput = '';

        const origLog = console.log;
        console.log = (...args) => {
            loggedOutput += args.join(' ') + '\n';
        };

        const origIsProduction = config.isProduction;
        const origResendApiKey = config.resendApiKey;

        // Simulate production with broken / unconfigured email
        config.isProduction = true;
        config.resendApiKey = '';

        const origFindOne = CustomerOtp.findOne;
        const origDeleteMany = CustomerOtp.deleteMany;
        const origSave = CustomerOtp.prototype.save;

        CustomerOtp.findOne = () => ({
            sort: async () => null,
        });
        CustomerOtp.deleteMany = async () => ({ deletedCount: 0 });
        CustomerOtp.prototype.save = async function () {
            return this;
        };

        try {
            await assert.rejects(
                async () => {
                    await customerOtpService.createAndSendCustomerOtp({
                        email: testEmail,
                        type: 'email_verification',
                        name: 'Prod Customer',
                    });
                },
                (err) => {
                    assert.equal(err.statusCode, 503, 'Must throw 503 AppError in production');
                    assert.match(
                        err.message,
                        /Unable to send verification email/,
                        'Must return user-friendly operational error'
                    );
                    return true;
                }
            );

            // Assert OTP was never printed to terminal
            assert.doesNotMatch(
                loggedOutput,
                /\[DEV EMAIL MODE\]/,
                'Production mode must never output DEV EMAIL banner'
            );
            assert.doesNotMatch(
                loggedOutput,
                /OTP Code:/,
                'Production mode must never log raw OTP code'
            );
        } finally {
            console.log = origLog;
            config.isProduction = origIsProduction;
            config.resendApiKey = origResendApiKey;
            CustomerOtp.findOne = origFindOne;
            CustomerOtp.deleteMany = origDeleteMany;
            CustomerOtp.prototype.save = origSave;
        }
    });
});
