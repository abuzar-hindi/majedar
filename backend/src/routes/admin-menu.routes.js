import { Router } from 'express';
import {
    getAdminMenu,
    getAdminMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from '../controllers/menu.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
    createMenuItemSchema,
    updateMenuItemSchema,
    menuIdParamSchema,
    menuQuerySchema,
} from '../validators/menu.validator.js';

const router = Router();

// Enforce admin authentication & authorization across all admin menu routes
router.use(authenticateAdmin, requireAdmin);

// Admin menu management endpoints
router.post('/', uploadSingleImage('image'), validate(createMenuItemSchema, 'body'), createMenuItem);
router.get('/', validate(menuQuerySchema, 'query'), getAdminMenu);
router.get('/:id', validate(menuIdParamSchema, 'params'), getAdminMenuItem);
router.patch(
    '/:id',
    uploadSingleImage('image'),
    validate(menuIdParamSchema, 'params'),
    validate(updateMenuItemSchema, 'body'),
    updateMenuItem
);
router.delete('/:id', validate(menuIdParamSchema, 'params'), deleteMenuItem);

export default router;
