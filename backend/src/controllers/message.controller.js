import * as messageService from '../services/message/message.service.js';

export const submitMessage = async (req, res, next) => {
    try {
        const result = await messageService.createMessage({
            customer: req.customer,
            type: req.body.type,
            message: req.body.message,
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been submitted successfully. Our management team will review it.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminMessages = async (req, res, next) => {
    try {
        const messages = await messageService.getMessages(req.query);
        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminMessageById = async (req, res, next) => {
    try {
        const message = await messageService.getMessageById(req.params.id);
        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAdminMessageStatus = async (req, res, next) => {
    try {
        const updated = await messageService.updateMessageStatus(req.params.id, req.body.status);
        res.status(200).json({
            success: true,
            message: 'Message status updated successfully',
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminUnreadCount = async (req, res, next) => {
    try {
        const data = await messageService.getUnreadMessageCount();
        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};
