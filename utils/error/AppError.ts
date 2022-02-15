export default class AppError extends Error {
    statusCode: number;
    status: string;

    constructor(statusCode: number, message: string) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }

    static notFound(name: string) {
        return new AppError(404, `${name} not found!`);
    }

    static serverError() {
        return new AppError(500, 'Something went wrong!');
    }
}
