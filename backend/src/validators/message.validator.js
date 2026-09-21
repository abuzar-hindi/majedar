import { z } from 'zod';
import { objectIdRegex } from './category.validator.js';

export const messageIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid message ID format'),
});

export const createMessageSchema = z
    .object({
        type: z
            .enum(['complaint', 'suggestion', 'query'], {
                message: 'Type must be one of: complaint, suggestion, query',
            })
            .default('query'),
        message: z
            .string({ required_error: 'Message content is required' })
            .trim()
            .min(5, 'Message must be at least 5 characters long')
            .max(2000, 'Message cannot exceed 2000 characters'),
    })
    .strip();

export const updateMessageStatusSchema = z
    .object({
        status: z.enum(['new', 'read', 'resolved'], {
            message: 'Status must be one of: new, read, resolved',
        }),
    })
    .strip();

export const messageQuerySchema = z
    .object({
        status: z.enum(['new', 'read', 'resolved']).optional(),
        type: z.enum(['complaint', 'suggestion', 'query']).optional(),
        search: z.string().trim().optional(),
    })
    .strip();
