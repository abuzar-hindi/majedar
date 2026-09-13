import * as categoryService from '../services/menu/category.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Public: Get active categories for diners.
 */
export const getPublicCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories({ onlyActive: true });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Categories retrieved successfully',
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get all categories including inactive ones.
 */
export const getAdminCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories({ onlyActive: false });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'All categories retrieved successfully',
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Create a new category.
 */
export const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body, req.file);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Category created successfully',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Update a category.
 */
export const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body, req.file);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Category updated successfully',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Delete a category.
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const result = await categoryService.deleteCategory(req.params.id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Category deleted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
