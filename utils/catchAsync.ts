import { NextFunction, Request, Response } from 'express';

type AsyncMiddlewareType = (
    req: Request & { user?: { id: string; role: 'admin' | 'user' } },
    res: Response,
    next?: NextFunction
) => Promise<void>;

export default (fn: AsyncMiddlewareType) =>
    (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
