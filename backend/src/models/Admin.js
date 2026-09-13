import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters long'],
            maxlength: [30, 'Name must be at most 30 characters long'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required'],
            select: false, // Never return passwordHash in queries unless explicitly requested
        },
        role: {
            type: String,
            enum: ['admin', 'super-admin'],
            default: 'admin',
        },
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

/**
 * Compare plain text password with stored password hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
adminSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) {
        throw new Error('Password hash not selected in query');
    }
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Admin = mongoose.model('Admin', adminSchema);