import { BadRequestError } from '../utils/errors.js';

export const validate = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const result = await schema.safeParseAsync(req[source]);
            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                return next(new BadRequestError('Validation failed', formattedErrors));
            }
            // Replace request input with sanitized/normalized parsed data
            if (source === 'query') {
                for (const key of Object.keys(req.query)) {
                    delete req.query[key];
                }
                Object.assign(req.query, result.data);
            } else if (source === 'params') {
                for (const key of Object.keys(req.params)) {
                    delete req.params[key];
                }
                Object.assign(req.params, result.data);
            } else {
                req[source] = result.data;
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
