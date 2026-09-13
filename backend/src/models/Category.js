import mongoose from 'mongoose';

export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            unique: true,
            minlength: [2, 'Category name must be at least 2 characters long'],
            maxlength: [50, 'Category name cannot exceed 50 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Category slug is required'],
            trim: true,
            unique: true,
            lowercase: true,
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

// Pre-validate hook to ensure slug is generated if missing
categorySchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = slugify(this.name);
    } else if (this.slug) {
        this.slug = slugify(this.slug);
    }
    next();
});

export const Category = mongoose.model('Category', categorySchema);
