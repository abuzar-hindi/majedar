import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import customerAuthRoutes from './routes/customer-auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import menuRoutes from './routes/menu.routes.js';
import adminCategoryRoutes from './routes/admin-category.routes.js';
import adminMenuRoutes from './routes/admin-menu.routes.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

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
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin/menu', adminMenuRoutes);

// Fallback 404 handler for unmatched endpoints
app.use(notFoundHandler);

// Centralized application error handler
app.use(errorHandler);

export default app;
