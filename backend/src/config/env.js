import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    port: parseInt(process.env.PORT, 10) || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production-min-32-chars',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
    cookie: {
        name: 'token',
        // 8 hours in milliseconds by default
        maxAge: 8 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
    },
    customerCookie: {
        name: 'customer_token',
        // 7 days in milliseconds by default for customers
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
    },
    cors: {
        origin: process.env.CLIENT_URL || true,
        credentials: true,
    },
};

