import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Area name is required'],
            trim: true,
            minlength: [2, 'Area name must be at least 2 characters long'],
            maxlength: [100, 'Area name must not exceed 100 characters'],
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Zone type is required'],
            enum: {
                values: ['0-3km', '3-5km'],
                message: '{VALUE} is not a valid delivery zone type. Allowed: 0-3km, 3-5km',
            },
            index: true,
        },
        deliveryFee: {
            type: Number,
            required: [true, 'Delivery fee is required'],
            enum: {
                values: [15, 30],
                message: 'Delivery fee must correspond to zone type: ₹15 for 0-3km, ₹30 for 3-5km',
            },
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
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

// Indexes for fast querying
deliveryZoneSchema.index({ isActive: 1, sortOrder: 1, name: 1 });

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
