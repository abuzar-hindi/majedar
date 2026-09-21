import webpush from 'web-push';
import { AdminPushSubscription } from '../../models/AdminPushSubscription.js';
import { config } from '../../config/env.js';

let isVapidConfigured = false;

/**
 * Configure VAPID details if keys are present.
 */
function ensureVapidDetails() {
    if (isVapidConfigured) return true;

    if (config.vapid?.publicKey && config.vapid?.privateKey) {
        try {
            webpush.setVapidDetails(
                config.vapid.subject || 'mailto:admin@majedaar.com',
                config.vapid.publicKey,
                config.vapid.privateKey
            );
            isVapidConfigured = true;
            return true;
        } catch (err) {
            console.error('[AdminPush] Failed to configure VAPID details:', err.message);
            return false;
        }
    }
    return false;
}

/**
 * Get the public VAPID key to share with authorized clients.
 * Never exposes the private key.
 *
 * @returns {string} Public VAPID key
 */
export function getVapidPublicKey() {
    return config.vapid?.publicKey || '';
}

/**
 * Save or update an admin push subscription.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.adminId
 * @param {Object} params.subscription - Browser PushSubscription object
 * @param {string} params.subscription.endpoint
 * @param {Object} params.subscription.keys
 * @param {string} params.subscription.keys.p256dh
 * @param {string} params.subscription.keys.auth
 * @param {string} [params.userAgent]
 * @returns {Promise<AdminPushSubscription>}
 */
export async function saveSubscription({ adminId, subscription, userAgent = null }) {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        throw new Error('Invalid push subscription structure. Missing endpoint or keys.');
    }

    const { endpoint, keys } = subscription;

    return await AdminPushSubscription.findOneAndUpdate(
        { endpoint },
        {
            admin: adminId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userAgent: userAgent || null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
}

/**
 * Remove a push subscription by endpoint.
 *
 * @param {Object} params
 * @param {string} params.endpoint
 * @param {string|mongoose.Types.ObjectId} [params.adminId]
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteSubscription({ endpoint, adminId = null }) {
    if (!endpoint) return false;

    const query = { endpoint };
    if (adminId) {
        query.admin = adminId;
    }

    const res = await AdminPushSubscription.deleteOne(query);
    return res.deletedCount > 0;
}

/**
 * Send a push notification to all active admin devices.
 *
 * Guaranteed to be non-blocking and safe: failures are caught, logged,
 * and stale subscriptions (410 Gone / 404 Not Found) are purged automatically.
 *
 * @param {Object} notification
 * @param {("NEW_ORDER"|"PAYMENT_RECEIVED"|"TEST")} notification.type
 * @param {string} notification.title - Short header
 * @param {string} notification.body - Short summary text
 * @param {string} notification.url - Deep link URL to open upon click
 * @param {Object} [notification.data] - Additional metadata
 * @returns {Promise<{ sent: number, failed: number, purged: number }>}
 */
export async function sendAdminPushNotification({ type, title, body, url, data = {} }) {
    if (!ensureVapidDetails()) {
        console.warn('[AdminPush] VAPID keys not configured; push delivery skipped.');
        return { sent: 0, failed: 0, purged: 0 };
    }

    try {
        const subscriptions = await AdminPushSubscription.find({});
        if (!subscriptions.length) {
            return { sent: 0, failed: 0, purged: 0 };
        }

        const payload = JSON.stringify({
            title: title || 'Majedaar Restaurant',
            body: body || '',
            icon: '/brand/logo-mark.svg',
            badge: '/brand/logo-mark.svg',
            data: {
                url: url || '/dashboard',
                type,
                timestamp: Date.now(),
                ...data,
            },
        });

        const pushOptions = {
            TTL: 86400, // 24 hours delivery window
            urgency: 'high',
        };

        const staleEndpointIds = [];
        let sentCount = 0;
        let failCount = 0;

        await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSub = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };

                try {
                    await webpush.sendNotification(pushSub, payload, pushOptions);
                    sentCount++;
                } catch (err) {
                    failCount++;
                    // 410 Gone or 404 Not Found indicates subscription expired or revoked
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        staleEndpointIds.push(sub._id);
                    } else {
                        console.error(`[AdminPush] Error sending push to endpoint:`, err.message);
                    }
                }
            })
        );

        let purgedCount = 0;
        if (staleEndpointIds.length) {
            const delRes = await AdminPushSubscription.deleteMany({ _id: { $in: staleEndpointIds } });
            purgedCount = delRes.deletedCount || 0;
        }

        return { sent: sentCount, failed: failCount, purged: purgedCount };
    } catch (globalErr) {
        console.error('[AdminPush] Unhandled error in sendAdminPushNotification:', globalErr.message);
        return { sent: 0, failed: 0, purged: 0 };
    }
}
