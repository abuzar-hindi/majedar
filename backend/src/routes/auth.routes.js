import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { loginAdminSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rate-limit.middleware.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Public auth routes with rate limiting and input validation
router.post('/login', authLimiter, validate(loginAdminSchema), login);
router.post('/logout', logout);

// Protected admin profile route requiring authentication and admin authorization
router.get('/me', authenticateAdmin, requireAdmin, getMe);

export default router;