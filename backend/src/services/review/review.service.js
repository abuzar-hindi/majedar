import mongoose from 'mongoose';
import { Review } from '../../models/Review.js';
import { Order } from '../../models/Order.js';
import { MenuItem } from '../../models/MenuItem.js';
import {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} from '../../utils/errors.js';

/**
 * Create a new customer review for a menu item in a completed order.
 */
export const createReview = async (customerId, { orderId, menuItemId, rating }) => {
    // 1. Fetch the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order not found');
    }

    // 2. Verify order belongs to the authenticated customer
    if (order.customer.toString() !== customerId.toString()) {
        throw new ForbiddenError('You can only review items from your own orders');
    }

    // 3. Verify the order is completed / delivered
    if (order.orderStatus !== 'completed') {
        throw new BadRequestError('You can only review items after your order is completed');
    }

    // 4. Verify menu item exists in database
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
        throw new NotFoundError('Menu item not found');
    }

    // 5. Verify menu item is present in this specific order
    const hasItem = order.items && order.items.some(
        (item) => item.menuItem && item.menuItem.toString() === menuItemId.toString()
    );
    if (!hasItem) {
        throw new BadRequestError('This menu item is not part of the specified order');
    }

    // 6. Check for existing duplicate review
    const existingReview = await Review.findOne({
        customer: customerId,
        order: orderId,
        menuItem: menuItemId,
    });
    if (existingReview) {
        throw new BadRequestError('You have already reviewed this menu item for this order');
    }

    // 7. Persist review
    const review = new Review({
        customer: customerId,
        menuItem: menuItemId,
        order: orderId,
        rating: Number(rating),
    });

    try {
        await review.save();
    } catch (err) {
        if (err.code === 11000) {
            throw new BadRequestError('You have already reviewed this menu item for this order');
        }
        throw err;
    }

    await review.populate([
        { path: 'customer', select: 'firstName lastName name avatar' },
        { path: 'menuItem', select: 'name price image' },
    ]);

    return review;
};

/**
 * Get reviews for a specific menu item with public-safe customer info.
 */
export const getMenuItemReviews = async (menuItemId, { page = 1, limit = 20 } = {}) => {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { menuItem: menuItemId };

    const [reviews, totalReviews, ratingSummary] = await Promise.all([
        Review.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('customer', 'firstName lastName name avatar')
            .lean(),
        Review.countDocuments(filter),
        getMenuItemRatingSummary(menuItemId),
    ]);

    return {
        reviews,
        ratingSummary,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalReviews,
            totalPages: Math.ceil(totalReviews / limitNum),
        },
    };
};

/**
 * Calculate rating summary (averageRating and reviewCount) for a menu item.
 */
export const getMenuItemRatingSummary = async (menuItemId) => {
    const objectId = mongoose.Types.ObjectId.isValid(menuItemId)
        ? new mongoose.Types.ObjectId(menuItemId)
        : menuItemId;

    const stats = await Review.aggregate([
        { $match: { menuItem: objectId } },
        {
            $group: {
                _id: '$menuItem',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    if (!stats || stats.length === 0) {
        return {
            averageRating: 0,
            reviewCount: 0,
        };
    }

    return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
    };
};

/**
 * Admin: View reviews across the platform.
 */
export const getAdminReviews = async ({ page = 1, limit = 20, rating } = {}) => {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (rating !== undefined) {
        filter.rating = Number(rating);
    }

    const [reviews, totalReviews] = await Promise.all([
        Review.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('customer', 'firstName lastName name email phone')
            .populate('menuItem', 'name price')
            .populate('order', 'orderNumber orderStatus')
            .lean(),
        Review.countDocuments(filter),
    ]);

    return {
        reviews,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalReviews,
            totalPages: Math.ceil(totalReviews / limitNum),
        },
    };
};

/**
 * Admin: Delete an inappropriate review.
 */
export const deleteReviewByAdmin = async (reviewId) => {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        throw new NotFoundError('Review not found');
    }
    return { id: review._id, message: 'Review deleted successfully' };
};
