import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerAddressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            trim: true,
            default: 'Home',
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        address: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
        },
        area: {
            type: String,
            trim: true,
            default: null,
        },
        deliveryZoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryZone',
            default: null,
        },
        landmark: {
            type: String,
            trim: true,
            default: null,
        },
        deliveryInstructions: {
            type: String,
            enum: ['Call on arrival', 'Leave at the gate', "Don't ring the bell", 'Other'],
            default: null,
        },
        deliveryInstructionOther: {
            type: String,
            trim: true,
            default: null,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name must be at most 100 characters long'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required'],
            select: false, // Never return passwordHash by default
        },
        emailVerified: {
            type: Boolean,
            default: false,
            index: true,
        },
        tokenVersion: {
            type: Number,
            default: 0,
        },
        addresses: [customerAddressSchema],
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform: (doc, ret) => {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
    }
);

customerSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) {
        throw new Error('Password hash not selected in query');
    }
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Customer = mongoose.model('Customer', customerSchema);
