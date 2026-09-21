import { Message } from '../../models/Message.js';
import { Customer } from '../../models/Customer.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors.js';

/**
 * Submit an authenticated customer message with duplicate spam prevention.
 * Customer identity is strictly derived from the authenticated account.
 */
export const createMessage = async ({
    customer = null,
    customerId = null,
    type = 'query',
    message,
}) => {
    let resolvedCustomer = customer;
    const targetCustomerId = customer?._id || customerId;

    if (!resolvedCustomer && targetCustomerId) {
        resolvedCustomer = await Customer.findById(targetCustomerId);
    }

    if (!resolvedCustomer) {
        throw new UnauthorizedError('Authentication required. Please log in to send a message.');
    }

    const senderName = resolvedCustomer.name?.trim() || 'Customer';
    const senderEmail = resolvedCustomer.email?.trim() || '';
    const senderPhone = resolvedCustomer.phone?.trim() || '';
    const trimmedMessage = message.trim();

    // Duplicate spam prevention: check if same message submitted by this customer in the last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const duplicateFilter = {
        customer: resolvedCustomer._id,
        message: trimmedMessage,
        createdAt: { $gte: oneMinuteAgo },
    };

    const recentDuplicate = await Message.findOne(duplicateFilter);
    if (recentDuplicate) {
        throw new BadRequestError('We already received this message. Please wait before submitting again.');
    }

    const newMessage = new Message({
        customer: resolvedCustomer._id,
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        type,
        message: trimmedMessage,
        status: 'new',
    });

    await newMessage.save();
    return newMessage;
};

/**
 * Get all messages for admin view with optional filtering and pagination.
 */
export const getMessages = async ({ status, type, search } = {}) => {
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (type) {
        filter.type = type;
    }

    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { message: regex },
        ];
    }

    const messages = await Message.find(filter)
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 });

    return messages;
};

/**
 * Get single message by ID.
 */
export const getMessageById = async (id) => {
    const message = await Message.findById(id).populate('customer', 'name email phone');
    if (!message) {
        throw new NotFoundError('Message not found');
    }
    return message;
};

/**
 * Update message status (e.g. mark read or resolved).
 */
export const updateMessageStatus = async (id, status) => {
    const message = await Message.findById(id);
    if (!message) {
        throw new NotFoundError('Message not found');
    }

    message.status = status;
    await message.save();
    return message.populate('customer', 'name email phone');
};

/**
 * Get count of unread (new) messages for badges.
 */
export const getUnreadMessageCount = async () => {
    const count = await Message.countDocuments({ status: 'new' });
    return { count };
};
