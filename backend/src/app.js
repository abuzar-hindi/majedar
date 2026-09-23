import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';

// Auth routes
import authRoutes from './routes/auth.routes.js';
import customerAuthRoutes from './routes/customer-auth.routes.js';

// Public & Customer feature routes
import categoryRoutes from './routes/category.routes.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import deliveryZoneRoutes from './routes/delivery-zone.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import contactRoutes from './routes/contact.routes.js';

// Admin feature routes
import adminCategoryRoutes from './routes/admin-category.routes.js';
import adminMenuRoutes from './routes/admin-menu.routes.js';
import adminOrderRoutes from './routes/admin-order.routes.js';
import adminDeliveryZoneRoutes from './routes/admin-delivery-zone.routes.js';
import adminPaymentRoutes from './routes/admin-payment.routes.js';
import adminReviewRoutes from './routes/admin-review.routes.js';
import adminMessageRoutes from './routes/admin-message.routes.js';
import adminPushRoutes from './routes/admin-push.routes.js';

import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Trust Render reverse proxy for HTTPS termination and secure cookies
app.set('trust proxy', 1);

// Webhook raw body parser (MUST run before express.json() for HMAC signature verification)
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));

// Security and parser middlewares
app.use(cors(config.cors));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Hi from Server' });
});

// Mount application routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);

// Customer & Public endpoints
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-zones', deliveryZoneRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Admin endpoints
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/menu', adminMenuRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/delivery-zones', adminDeliveryZoneRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/admin/push', adminPushRoutes);

// Fallback 404 handler for unmatched endpoints
app.use(notFoundHandler);

// Centralized application error handler
app.use(errorHandler);

export default app;
