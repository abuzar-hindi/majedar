import mongoose from 'mongoose';

/**
 * AdminPushSubscription Schema
 *
 * Stores Web Push subscriptions for authenticated admins.
 * One admin may have multiple subscriptions across various devices/browsers.
 * The endpoint is unique per browser push registration.
 */
const adminPushSubscriptionSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: [true, 'Admin reference is required'],
            index: true,
        },
        endpoint: {
            type: String,
            required: [true, 'Push subscription endpoint is required'],
            unique: true,
            trim: true,
            index: true,
        },
        p256dh: {
            type: String,
            required: [true, 'p256dh key is required'],
            trim: true,
        },
        auth: {
            type: String,
            required: [true, 'auth key is required'],
            trim: true,
        },
        userAgent: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

export const AdminPushSubscription = mongoose.model(
    'AdminPushSubscription',
    adminPushSubscriptionSchema
);
