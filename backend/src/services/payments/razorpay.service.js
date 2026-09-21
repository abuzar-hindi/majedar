import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import { config } from '../../config/env.js';
import { BadRequestError, AppError } from '../../utils/errors.js';

/**
 * Lazily initialized Razorpay client.
 * Initialized on first use to allow the app to start even without Razorpay keys during development.
 */
let _razorpayClient = null;

export const setRazorpayClient = (client) => {
    _razorpayClient = client;
};

export const getRazorpayClient = () => {
    if (!_razorpayClient) {
        const { keyId, keySecret } = config.razorpay;
        if (!keyId || !keySecret) {
            throw new AppError('Online payment is temporarily unavailable. Please try again later or pay with Cash on Delivery.', 500);
        }
        _razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
    return _razorpayClient;
};

/**
 * Create a Razorpay Order.
 *
 * @param {number} amountInPaise - Must be an integer in the smallest currency unit (paise for INR)
 * @param {string} currency - e.g. 'INR'
 * @param {string} receipt - Internal receipt reference (application orderId)
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async (amountInPaise, currency, receipt) => {
    // Strict integer enforcement — prevents floating-point paise errors
    const amount = Math.round(amountInPaise);
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new BadRequestError('Payment amount must be a positive integer in paise.');
    }

    const client = getRazorpayClient();

    try {
        const razorpayOrder = await client.orders.create({
            amount,
            currency: currency || 'INR',
            receipt: String(receipt).slice(0, 40), // Razorpay receipt max 40 chars
        });
        return razorpayOrder;
    } catch (err) {
        // Do NOT log or expose Razorpay internal errors
        throw new AppError('Online payment is temporarily unavailable. Please try again later.', 502);
    }
};

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * Razorpay Standard Checkout signature = HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, keySecret)
 *
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature
 * @returns {boolean} true if valid
 */
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const { keySecret } = config.razorpay;
    if (!keySecret) {
        throw new AppError('Razorpay key secret not configured.', 500);
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(razorpaySignature, 'hex')
        );
    } catch {
        return false;
    }
};

/**
 * Verify Razorpay webhook signature using HMAC SHA256 with webhook secret.
 * Must be called with the RAW request body (Buffer or string) — not parsed JSON.
 *
 * @param {Buffer|string} rawBody - Raw request body from Express
 * @param {string} razorpaySignature - Value of 'x-razorpay-signature' header
 * @returns {boolean} true if valid
 */
export const verifyWebhookSignature = (rawBody, razorpaySignature) => {
    const { webhookSecret } = config.razorpay;
    if (!webhookSecret) {
        throw new AppError('Razorpay webhook secret not configured.', 500);
    }

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(razorpaySignature, 'hex')
        );
    } catch {
        return false;
    }
};

/**
 * Fetch payment details directly from Razorpay API.
 * Used for the "payment succeeded but frontend lost connection" recovery case.
 *
 * @param {string} razorpayPaymentId
 * @returns {Promise<Object>} Razorpay payment object
 */
export const fetchRazorpayPayment = async (razorpayPaymentId) => {
    const client = getRazorpayClient();
    try {
        return await client.payments.fetch(razorpayPaymentId);
    } catch {
        return null;
    }
};

/**
 * Initiate a refund for a captured Razorpay payment.
 *
 * @param {string} razorpayPaymentId
 * @param {number} amountInPaise - Amount to refund; must be <= original payment amount
 * @param {string} notes - Optional internal notes
 * @returns {Promise<Object>} Razorpay refund object
 */
export const createRazorpayRefund = async (razorpayPaymentId, amountInPaise, notes = {}) => {
    const amount = Math.round(amountInPaise);
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new BadRequestError('Refund amount must be a positive integer in paise.');
    }

    const client = getRazorpayClient();
    try {
        return await client.payments.refund(razorpayPaymentId, { amount, notes });
    } catch {
        throw new AppError('Failed to process refund. Please try again.', 502);
    }
};

/**
 * Convert rupees (with decimals) to paise (integer).
 * Uses Math.round to prevent floating-point drift.
 * Example: 658.95 → 65895
 *
 * @param {number} rupees
 * @returns {number} integer paise
 */
export const rupeesToPaise = (rupees) => {
    return Math.round(rupees * 100);
};
