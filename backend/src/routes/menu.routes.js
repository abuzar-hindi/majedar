import { Router } from 'express';
import { getPublicMenu, getPublicMenuItem } from '../controllers/menu.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { menuQuerySchema, menuIdParamSchema } from '../validators/menu.validator.js';

const router = Router();

// Public: Get menu items with optional category, search, veg, bestseller filters and sorting
router.get('/', validate(menuQuerySchema, 'query'), getPublicMenu);

// Public: Get single available menu item by ID
router.get('/:id', validate(menuIdParamSchema, 'params'), getPublicMenuItem);

export default router;
