import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Menu item name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [5, 'Description must be at least 5 characters long'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0.01, 'Price must be a positive number greater than zero'],
            index: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category reference is required'],
            index: true,
        },
        image: {
            url: {
                type: String,
                default: null,
            },
            publicId: {
                type: String,
                default: null,
            },
        },
        isVeg: {
            type: Boolean,
            default: true,
            index: true,
        },
        isBestseller: {
            type: Boolean,
            default: false,
            index: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
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

// Add compound text index for search on name and description
menuItemSchema.index({ name: 'text', description: 'text' });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);