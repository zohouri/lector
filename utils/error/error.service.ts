/* eslint-disable @typescript-eslint/no-explicit-any */
import { Error } from 'mongoose';
import AppError from './AppError';

const handleCastErrorDB = (err: any) => {
    const message = `Invalid data: ${err.path}`;
    return new AppError(400, message);
};

const handleDuplicateFieldsDB = (err: any) => {
    const value = err.keyValue[Object.keys(err.keyValue)[0]];
    const message = `'${value}' is duplicate! Provide another value`;
    return new AppError(400, message);
};

const handleValidationErrorDB = (err: any) => {
    const firstError = Object.values(err.errors)[0] as Error;
    if (firstError.name === 'CastError') return handleCastErrorDB(firstError);
    return new AppError(400, firstError.message);
};

const handleValidationErrorJoi = (err: any) => {
    const firstError = err.details[0];
    return new AppError(400, firstError.message);
};

const handleJWTError = () => {
    const message = 'Access token is not valid!';
    return new AppError(401, message);
};

const handleJWTExpiredError = () => {
    const message = 'Access token is expired, Login again!';
    return new AppError(401, message);
};

const handleUploadFileSizeLimitError = () => {
    const message = 'File is too large!';
    return new AppError(400, message);
};

const handleUploadFileCountLimitError = () => {
    const message = 'The number of files is more than the allowed number.';
    return new AppError(400, message);
};

export default (error: any) => {
    let formattedError;

    if (error.isJoi) {
        formattedError = handleValidationErrorJoi(error);
    } else if (error.name === 'CastError') {
        formattedError = handleCastErrorDB(error);
    } else if (error.code === 11000) {
        formattedError = handleDuplicateFieldsDB(error);
    } else if (error.name === 'ValidationError') {
        formattedError = handleValidationErrorDB(error);
    } else if (error.name === 'JsonWebTokenError') {
        formattedError = handleJWTError();
    } else if (error.name === 'TokenExpiredError') {
        formattedError = handleJWTExpiredError();
    } else if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
        formattedError = handleUploadFileSizeLimitError();
    } else if (error.name === 'MulterError' && error.code === 'LIMIT_UNEXPECTED_FILE') {
        formattedError = handleUploadFileCountLimitError();
    }

    return formattedError || error;
};
