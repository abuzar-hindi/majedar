import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
});

/**
 * Reusable middleware for handling single image uploads under field 'image'
 */
export const uploadSingleImage = (fieldName = 'image') => {
    const multerMiddleware = upload.single(fieldName);

    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new BadRequestError('File too large. Maximum allowed size is 5MB.'));
                }
                return next(new BadRequestError(`Upload error: ${err.message}`));
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};
