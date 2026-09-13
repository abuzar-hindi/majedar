import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/customer-auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { customerSignupSchema, customerLoginSchema } from '../validators/customer-auth.validator.js';
import { customerAuthLimiter } from '../middleware/rate-limit.middleware.js';
import { authenticateCustomer } from '../middleware/customer-auth.middleware.js';

const router = Router();

// Public customer authentication endpoints
router.post('/signup', customerAuthLimiter, validate(customerSignupSchema), signup);
router.post('/login', customerAuthLimiter, validate(customerLoginSchema), login);
router.post('/logout', logout);

// Protected customer profile endpoint
router.get('/me', authenticateCustomer, getMe);

export default router;
