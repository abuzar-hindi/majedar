import { Router } from 'express';
import {
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
    createCategorySchema,
    updateCategorySchema,
    categoryIdParamSchema,
} from '../validators/category.validator.js';

const router = Router();

// Enforce admin authentication & authorization across all admin category routes
router.use(authenticateAdmin, requireAdmin);

// Admin category management endpoints
router.get('/', getAdminCategories);
router.post('/', uploadSingleImage('image'), validate(createCategorySchema, 'body'), createCategory);
router.patch(
    '/:id',
    uploadSingleImage('image'),
    validate(categoryIdParamSchema, 'params'),
    validate(updateCategorySchema, 'body'),
    updateCategory
);
router.delete('/:id', validate(categoryIdParamSchema, 'params'), deleteCategory);

export default router;
