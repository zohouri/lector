declare module 'xss-clean' {
    import { NextFunction, Request, Response } from 'express';
    export default function xss(): (
        req: Request,
        res: Response,
        next: NextFunction
    ) => void;
}
