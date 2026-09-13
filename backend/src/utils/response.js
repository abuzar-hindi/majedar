export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null } = {}) => {
    const responsePayload = {
        success: true,
        message,
    };

    if (data !== null && data !== undefined) {
        responsePayload.data = data;
    }

    return res.status(statusCode).json(responsePayload);
};

