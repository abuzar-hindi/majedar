import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { CustomerOtp } from '../../models/CustomerOtp.js';
import { BadRequestError, TooManyRequestsError, AppError } from '../../utils/errors.js';
import { config } from '../../config/env.js';
import {
    sendVerificationOtpEmail,
    sendPasswordResetOtpEmail,
} from '../email/resend.service.js';

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 */
export const generateSecureOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

export const createAndSendCustomerOtp = async ({
    email,
    type,
    customerId = null,
    name = 'Customer',
}) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check resend cooldown
    const latestOtp = await CustomerOtp.findOne({
        email: normalizedEmail,
        type,
    }).sort({ createdAt: -1 });

    if (
        latestOtp &&
        latestOtp.resendCooldownUntil &&
        latestOtp.resendCooldownUntil.getTime() > Date.now()
    ) {
        const remainingSeconds = Math.max(
            1,
            Math.ceil((latestOtp.resendCooldownUntil.getTime() - Date.now()) / 1000)
        );
        throw new TooManyRequestsError(
            `Please wait ${remainingSeconds} seconds before requesting another code.`
        );
    }

    // Invalidate/cleanup any previous unconsumed OTPs for this email and type
    await CustomerOtp.deleteMany({
        email: normalizedEmail,
        type,
        consumedAt: null,
    });

    // Generate and hash OTP
    const rawOtp = generateSecureOtp();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const now = Date.now();

    const otpDoc = new CustomerOtp({
        email: normalizedEmail,
        customerId,
        type,
        otpHash,
        attempts: 0,
        maxAttempts: MAX_OTP_ATTEMPTS,
        expiresAt: new Date(now + OTP_EXPIRY_MS),
        resendCooldownUntil: new Date(now + RESEND_COOLDOWN_MS),
    });

    await otpDoc.save();

    // Dispatch email via Resend
    try {
        if (type === 'email_verification') {
            await sendVerificationOtpEmail({ email: normalizedEmail, name, otp: rawOtp });
        } else if (type === 'password_reset') {
            await sendPasswordResetOtpEmail({ email: normalizedEmail, name, otp: rawOtp });
        }
    } catch (emailError) {
        if (config.isProduction) {
            // In production, never expose OTP and abort so frontend does not falsely report success
            console.error('[CustomerOtpService] Email dispatch failed in production:', emailError.message);
            throw new AppError('Unable to send verification email. Please try again later.', 503);
        } else {
            console.warn('[CustomerOtpService] Email dispatch failed in dev mode:', emailError.message);
        }
    }

    return { success: true };
};

/**
 * Verify customer OTP against stored hash with attempt limits and single-use invalidation.
 */
export const verifyCustomerOtp = async ({ email, otp, type }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Find the latest unconsumed OTP record including the hidden otpHash
    const otpRecord = await CustomerOtp.findOne({
        email: normalizedEmail,
        type,
        consumedAt: null,
    })
        .select('+otpHash')
        .sort({ createdAt: -1 });

    // Check if OTP exists and is not expired
    if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
        throw new BadRequestError('Invalid or expired verification code');
    }

    // Check if max attempts already exceeded
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
        // Permanently invalidate this OTP
        otpRecord.consumedAt = new Date();
        await otpRecord.save();
        throw new BadRequestError(
            'Maximum verification attempts exceeded. Please request a new code.'
        );
    }

    // Verify hash
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isMatch) {
        otpRecord.attempts += 1;
        await otpRecord.save();

        if (otpRecord.attempts >= otpRecord.maxAttempts) {
            otpRecord.consumedAt = new Date();
            await otpRecord.save();
            throw new BadRequestError(
                'Maximum verification attempts exceeded. Please request a new code.'
            );
        }

        throw new BadRequestError('Invalid or expired verification code');
    }

    // Invalidate immediately (single-use)
    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    return { success: true, otpRecord };
};
