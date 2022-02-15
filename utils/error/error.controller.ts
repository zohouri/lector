import AppError from './AppError';
import { Request, Response, NextFunction } from 'express';
import errorService from './error.service';

type ErrorResponseType = {
    status: string;
    message: string;
    stack?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (err: any, req: Request, res: Response, next: NextFunction) => {
    const formattedError = errorService(err);

    let response: ErrorResponseType;

    if (formattedError instanceof AppError) {
        response = {
            status: formattedError.status,
            message: formattedError.message
        };
    } else {
        response = {
            status: 'error',
            message: 'Something went wrong!'
        };

        console.error('error', formattedError);
    }

    if (process.env.NODE_ENV === 'development') {
        response.stack = formattedError.stack;
    }

    res.status(formattedError.statusCode || 500).json(response);
};
