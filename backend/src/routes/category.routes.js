import { Router } from 'express';
import { getPublicCategories } from '../controllers/category.controller.js';

const router = Router();

// Public: Get all active categories
router.get('/', getPublicCategories);

export default router;
