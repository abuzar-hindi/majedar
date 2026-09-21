import mongoose from 'mongoose';

const customerOtpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            index: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
            index: true,
        },
        type: {
            type: String,
            required: [true, 'OTP type is required'],
            enum: ['email_verification', 'password_reset'],
            index: true,
        },
        otpHash: {
            type: String,
            required: [true, 'OTP hash is required'],
            select: false, // Never return OTP hash in default queries
        },
        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxAttempts: {
            type: Number,
            default: 5,
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiration date is required'],
        },
        consumedAt: {
            type: Date,
            default: null,
        },
        resendCooldownUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.otpHash;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform: (doc, ret) => {
                delete ret.otpHash;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Automatic MongoDB TTL cleanup after expiry
customerOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound query index
customerOtpSchema.index({ email: 1, type: 1, consumedAt: 1, createdAt: -1 });

export const CustomerOtp = mongoose.model('CustomerOtp', customerOtpSchema);
