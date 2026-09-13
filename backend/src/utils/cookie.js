import { config } from '../config/env.js';

export const setAuthCookie = (res, token) => {
    res.cookie(config.cookie.name, token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
        path: config.cookie.path,
    });
};

/**
 * Clear the authentication cookie.
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
    res.clearCookie(config.cookie.name, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,
        sameSite: config.cookie.sameSite,
        path: config.cookie.path,
    });
};

export const setCustomerAuthCookie = (res, token) => {
    res.cookie(config.customerCookie.name, token, {
        httpOnly: config.customerCookie.httpOnly,
        secure: config.customerCookie.secure,
        sameSite: config.customerCookie.sameSite,
        maxAge: config.customerCookie.maxAge,
        path: config.customerCookie.path,
    });
};

export const clearCustomerAuthCookie = (res) => {
    res.clearCookie(config.customerCookie.name, {
        httpOnly: config.customerCookie.httpOnly,
        secure: config.customerCookie.secure,
        sameSite: config.customerCookie.sameSite,
        path: config.customerCookie.path,
    });
};

