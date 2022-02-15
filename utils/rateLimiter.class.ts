import { RateLimiterRedis } from 'rate-limiter-flexible';
import createRedisClient from './redisHandler';
import AppError from './error/AppError';
import { NextFunction, Request, Response } from 'express';

export default class RateLimiterMiddleware {
    rateLimiterRedis: RateLimiterRedis;

    constructor(
        redisKeyPrefix = 'rl_api',
        maxRequestsAllowed = 120,
        durationInSeconds = 60
    ) {
        this.rateLimiterRedis = new RateLimiterRedis({
            storeClient: createRedisClient(false), // 'enableOfflineQueue' must be false based on 'rate-limiter-flexible' documentation
            keyPrefix: redisKeyPrefix,
            points: maxRequestsAllowed,
            duration: durationInSeconds
        });
    }

    getMiddleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            this.rateLimiterRedis
                .consume(req.ip)
                .then(() => {
                    next();
                })
                .catch(() => {
                    next(
                        new AppError(
                            429,
                            'The number of requests sent from this IP is too many!'
                        )
                    );
                });
        };
    }
}
