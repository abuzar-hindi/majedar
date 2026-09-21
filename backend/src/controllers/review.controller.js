import * as reviewService from '../services/review/review.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Customer: Create a review for a purchased menu item in a completed order.
 */
export const createReviewHandler = async (req, res, next) => {
    try {
        const customerId = req.customer._id;
        const review = await reviewService.createReview(customerId, req.body);
        return sendSuccess(res, {
            statusCode: 201,
            message: 'Review submitted successfully',
            data: { review },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public: Get reviews and rating summary for a menu item.
 */
export const getMenuItemReviewsHandler = async (req, res, next) => {
    try {
        const menuItemId = req.params.menuItemId || req.params.id;
        const result = await reviewService.getMenuItemReviews(menuItemId, req.query);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Reviews retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get all reviews with moderation details.
 */
export const getAdminReviewsHandler = async (req, res, next) => {
    try {
        const result = await reviewService.getAdminReviews(req.query);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Admin reviews retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Delete an inappropriate review.
 */
export const deleteReviewHandler = async (req, res, next) => {
    try {
        const result = await reviewService.deleteReviewByAdmin(req.params.id);
        return sendSuccess(res, {
            statusCode: 200,
            message: 'Review deleted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
