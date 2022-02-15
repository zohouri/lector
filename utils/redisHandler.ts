import Redis from 'ioredis';

const createClient = (enableOfflineQue = true) => {
    const redisClient = new Redis({
        password: process.env.REDIS_PASSWORD,
        // This is the default value of `retryStrategy`
        retryStrategy(times) {
            if (times < 3) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }

            throw new Error('Failed to connect to redis after 3 attempts');

            // return null;
        },
        enableOfflineQueue: enableOfflineQue
    });

    redisClient.on('error', err => {
        console.log('Redis connection error: ', err.message);
    });

    return redisClient;
};

export default createClient;
