import { Router } from 'express';
import {
    getAdminMessages,
    getAdminMessageById,
    updateAdminMessageStatus,
    getAdminUnreadCount,
} from '../controllers/message.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    messageIdParamSchema,
    updateMessageStatusSchema,
    messageQuerySchema,
} from '../validators/message.validator.js';

const router = Router();

// Enforce admin authentication & authorization across all admin message routes
router.use(authenticateAdmin, requireAdmin);

router.get('/unread-count', getAdminUnreadCount);
router.get('/', validate(messageQuerySchema, 'query'), getAdminMessages);
router.get('/:id', validate(messageIdParamSchema, 'params'), getAdminMessageById);
router.patch(
    '/:id/status',
    validate(messageIdParamSchema, 'params'),
    validate(updateMessageStatusSchema, 'body'),
    updateAdminMessageStatus
);

export default router;
