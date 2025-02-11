// Helper function for error responses
const handleErrorResponse = (res, message, errorCode, errorMessage) => {
    return res.status(errorCode).json({
        success: false,
        message,
        error: {
            CODE: "BAD_REQUEST",
            MESSAGE: errorMessage
        }
    });
};