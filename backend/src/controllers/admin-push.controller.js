import { z } from 'zod';
import {
    getVapidPublicKey,
    saveSubscription,
    deleteSubscription,
    sendAdminPushNotification,
} from '../services/notifications/admin-push.service.js';
import { BadRequestError } from '../utils/errors.js';

// Validation schemas
const subscribeSchema = z.object({
    endpoint: z.string().url('A valid URL endpoint is required'),
    keys: z.object({
        p256dh: z.string().min(1, 'p256dh key is required'),
        auth: z.string().min(1, 'auth key is required'),
    }),
});

const unsubscribeSchema = z.object({
    endpoint: z.string().url('A valid URL endpoint is required'),
});

/**
 * GET /api/admin/push/vapid-public-key
 * Return the public VAPID key to the authenticated admin.
 */
export const getPublicKey = async (req, res) => {
    const publicKey = getVapidPublicKey();
    return res.status(200).json({
        status: 'success',
        data: {
            publicKey,
        },
    });
};

/**
 * POST /api/admin/push/subscribe
 * Register or update an admin push subscription for the authenticated admin.
 */
export const subscribe = async (req, res, next) => {
    try {
        const parsed = subscribeSchema.safeParse(req.body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || 'Invalid subscription payload';
            throw new BadRequestError(firstError);
        }

        const subscription = parsed.data;
        const userAgent = req.headers['user-agent'] || null;

        await saveSubscription({
            adminId: req.admin._id,
            subscription,
            userAgent,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Push subscription saved successfully',
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/push/unsubscribe
 * Unsubscribe a device by its push endpoint.
 */
export const unsubscribe = async (req, res, next) => {
    try {
        const parsed = unsubscribeSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new BadRequestError('Invalid endpoint provided for unsubscription');
        }

        await deleteSubscription({
            endpoint: parsed.data.endpoint,
            adminId: req.admin._id,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Push subscription removed successfully',
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/push/test
 * Send a test push notification to verify admin device setup.
 */
export const sendTestAlert = async (req, res, next) => {
    try {
        const result = await sendAdminPushNotification({
            type: 'TEST',
            title: 'Test Notification — Majedaar',
            body: 'Push alerts are working properly on this device!',
            url: '/dashboard',
            data: { test: true },
        });

        return res.status(200).json({
            status: 'success',
            message: 'Test notification sent',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};
