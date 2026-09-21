import { Router } from 'express';
import {
    signup,
    login,
    logout,
    getMe,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from '../controllers/customer-auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    customerSignupSchema,
    customerLoginSchema,
    verifyEmailSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateCustomerProfileSchema,
    customerAddressInputSchema,
    addressIdParamSchema,
} from '../validators/customer-auth.validator.js';
import {
    customerAuthLimiter,
    customerOtpLimiter,
    customerOtpVerifyLimiter,
} from '../middleware/rate-limit.middleware.js';
import { authenticateCustomer } from '../middleware/customer-auth.middleware.js';

const router = Router();

// Public customer authentication endpoints
router.post('/signup', customerAuthLimiter, validate(customerSignupSchema), signup);
router.post('/login', customerAuthLimiter, validate(customerLoginSchema), login);
router.post('/logout', logout);

// Verification and password reset endpoints
router.post('/verify-email', customerOtpVerifyLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', customerOtpLimiter, validate(resendOtpSchema), resendOtp);
router.post('/forgot-password', customerOtpLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', customerOtpVerifyLimiter, validate(resetPasswordSchema), resetPassword);

// Protected customer profile endpoints
router.get('/me', authenticateCustomer, getMe);
router.patch('/profile', authenticateCustomer, validate(updateCustomerProfileSchema), updateProfile);

// Protected address book endpoints
router.get('/addresses', authenticateCustomer, getAddresses);
router.post('/addresses', authenticateCustomer, validate(customerAddressInputSchema), addAddress);
router.patch(
    '/addresses/:addressId',
    authenticateCustomer,
    validate(addressIdParamSchema, 'params'),
    validate(customerAddressInputSchema),
    updateAddress
);
router.delete(
    '/addresses/:addressId',
    authenticateCustomer,
    validate(addressIdParamSchema, 'params'),
    deleteAddress
);
router.patch(
    '/addresses/:addressId/default',
    authenticateCustomer,
    validate(addressIdParamSchema, 'params'),
    setDefaultAddress
);

export default router;
