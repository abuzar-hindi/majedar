import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
