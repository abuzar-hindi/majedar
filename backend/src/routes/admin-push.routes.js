import express from 'express';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import {
    getPublicKey,
    subscribe,
    unsubscribe,
    sendTestAlert,
} from '../controllers/admin-push.controller.js';

const router = express.Router();

// All push notification endpoints strictly require authenticated admin access
router.use(authenticateAdmin);

router.get('/vapid-public-key', getPublicKey);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/test', sendTestAlert);

export default router;
