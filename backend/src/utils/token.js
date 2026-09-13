import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Sign a JWT for an admin payload.
 * @param {Object} payload - Data to encode in token (e.g. { id, role })
 * @param {string|number} [expiresIn] - Optional custom expiration
 * @returns {string} Signed JWT
 */
export const signToken = (payload, expiresIn = config.jwt.expiresIn) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn,
    });
};

/**
 * Verify a JWT string.
 * @param {string} token - The JWT string
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.secret);
};
