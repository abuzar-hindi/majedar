import * as menuService from '../services/menu/menu.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Public: Get menu items for diners (available items only).
 */
export const getPublicMenu = async (req, res, next) => {
    try {
        const items = await menuService.getMenuItems({ ...req.query, isPublic: true });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Menu items retrieved successfully',
            data: { menu: items },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public: Get single menu item by ID.
 */
export const getPublicMenuItem = async (req, res, next) => {
    try {
        const item = await menuService.getMenuItemById(req.params.id, { isPublic: true });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Menu item retrieved successfully',
            data: { item },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get all menu items (including unavailable items).
 */
export const getAdminMenu = async (req, res, next) => {
    try {
        const items = await menuService.getMenuItems({ ...req.query, isPublic: false });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'All menu items retrieved successfully',
            data: { menu: items },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get single menu item by ID.
 */
export const getAdminMenuItem = async (req, res, next) => {
    try {
        const item = await menuService.getMenuItemById(req.params.id, { isPublic: false });
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Menu item retrieved successfully',
            data: { item },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Create a new menu item.
 */
export const createMenuItem = async (req, res, next) => {
    try {
        const item = await menuService.createMenuItem(req.body, req.file);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Menu item created successfully',
            data: { item },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Update a menu item (fields, image, availability, bestseller status).
 */
export const updateMenuItem = async (req, res, next) => {
    try {
        const item = await menuService.updateMenuItem(req.params.id, req.body, req.file);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Menu item updated successfully',
            data: { item },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Delete a menu item.
 */
export const deleteMenuItem = async (req, res, next) => {
    try {
        const result = await menuService.deleteMenuItem(req.params.id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Menu item deleted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
