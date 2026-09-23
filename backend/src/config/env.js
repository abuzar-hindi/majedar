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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    },
    customerCookie: {
        name: 'customer_token',
        // 7 days in milliseconds by default for customers
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    },
    cors: {
        origin: process.env.CLIENT_URL
            ? process.env.CLIENT_URL.includes(',')
                ? process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean)
                : process.env.CLIENT_URL.trim().replace(/\/+$/, '')
            : true,
        credentials: true,
    },
    resendApiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'Majedaar Restaurant <noreply@majedaar.com>',
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },
    vapid: {
        publicKey: process.env.VAPID_PUBLIC_KEY || 'BJ8B4LAumNPlvBe0a4VC2MuuvzMh6IXk-OH1rJqbozPqLs_XlJ8zzqg8C2wmGCz4wEPQb9Z9XMJeO_5zitiz59s',
        privateKey: process.env.VAPID_PRIVATE_KEY || 'EtwHkxk3C_nlHmo0Dwi6imRzgJcwZsif7Ws31B7HbbM',
        subject: process.env.VAPID_SUBJECT || 'mailto:majedarrestaurant@gmail.com',
    },
};

