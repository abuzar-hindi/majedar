import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: [true, 'Menu item reference is required'],
        },
        name: {
            type: String,
            required: [true, 'Item name snapshot is required'],
            trim: true,
        },
        variant: {
            type: String,
            enum: ['single', 'half', 'full'],
            default: 'single',
            required: [true, 'Selected variant snapshot is required'],
        },
        unitPrice: {
            type: Number,
            required: [true, 'Item unit price snapshot is required'],
            min: [0, 'Unit price cannot be negative'],
        },
        price: {
            type: Number,
            required: [true, 'Item price snapshot is required'],
            min: [0, 'Price cannot be negative'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        image: {
            type: String,
            default: null,
        },
        subtotal: {
            type: Number,
            required: [true, 'Item subtotal is required'],
            min: [0, 'Subtotal cannot be negative'],
        },
    },
    { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
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
            required: [true, 'Email address is required'],
            lowercase: true,
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Delivery street address is required'],
            trim: true,
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
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer reference is required'],
            index: true,
        },
        items: {
            type: [orderItemSnapshotSchema],
            required: [true, 'Order must contain at least one item'],
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: 'Order items array cannot be empty',
            },
        },
        deliveryAddress: {
            type: deliveryAddressSchema,
            required: [true, 'Delivery address is required'],
        },
        orderType: {
            type: String,
            enum: ['delivery', 'pickup', 'dine_in'],
            default: 'delivery',
            index: true,
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is required'],
            min: [0, 'Subtotal cannot be negative'],
        },
        gst: {
            type: Number,
            min: [0, 'GST cannot be negative'],
            default: 0,
        },
        deliveryFee: {
            type: Number,
            required: [true, 'Delivery fee is required'],
            min: [0, 'Delivery fee cannot be negative'],
            default: 0,
        },
        total: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total cannot be negative'],
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'razorpay'],
            default: 'cod',
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
            index: true,
        },
        orderStatus: {
            type: String,
            enum: ['placed', 'preparing', 'completed', 'cancelled'],
            default: 'placed',
            index: true,
        },
        pushNotificationSent: {
            type: Boolean,
            default: false,
            index: true,
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

// Indexes for fast lookup
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);