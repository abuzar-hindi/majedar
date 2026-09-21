import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer is required'],
            index: true,
        },
        name: {
            type: String,
            trim: true,
            default: '',
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        type: {
            type: String,
            enum: ['complaint', 'suggestion', 'query', 'order_issue'],
            required: [true, 'Message type is required'],
            default: 'query',
            index: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
            index: true,
        },
        orderNumber: {
            type: String,
            trim: true,
            default: null,
            index: true,
        },
        issueType: {
            type: String,
            enum: ['wrong_item', 'missing_item', 'damaged_spilled', 'payment_issue', 'delivery_issue', 'other'],
            default: null,
            index: true,
        },
        message: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true,
            minlength: [5, 'Message must be at least 5 characters long'],
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['new', 'read', 'resolved'],
            default: 'new',
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

messageSchema.index({ status: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
