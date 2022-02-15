import setEnvVariables from './configs/setEnvVariables';
setEnvVariables();
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import apiV1Router from './api_v1/router';
import AppError from './utils/error/AppError';
import globalErrorHandler from './utils/error/error.controller';
import { connect as connectDb, disconnect as disconnectDb } from 'mongoose';
import { Server } from 'http';
import RateLimiter from './utils/rateLimiter.class';
import xss from 'xss-clean';

let server: Server;
const app = express();

//------------GLOBAL MIDDLEWARES------------
const globalRateLimiter = new RateLimiter(process.env.RATE_LIMIT_PREFIX_API, 120, 60);
app.use('/api', globalRateLimiter.getMiddleware());

app.use(cookieParser());

app.use(helmet());

app.use(express.json());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: /^http:\/\/127.0.0.1/, credentials: true }));
}

//------------ROUTES------------
app.use('/api/v1', apiV1Router);

app.all('*', (req: Request, res: Response) => {
    throw new AppError(404, `URL not found: ${req.originalUrl}.`);
});

//------------SERVER------------
console.log(`⚡NODE ENV is ${process.env.NODE_ENV}.`);
connectDb(process.env.DATABASE_LOCAL || '').then(async () => {
    console.log('⚡Database connection established successfully.');

    server = app.listen(process.env.PORT, () => {
        console.log(`⚡Server is up and running on port ${process.env.PORT}`);
    });
});

//------------ERROR HANDLING------------
app.use(globalErrorHandler);

function shutDownGracefully() {
    console.log('... Shutting down the application ...');
    if (server) {
        server.close(err => {
            if (err) {
                console.log('❌ Closing the server was failed!');
                process.exit(1);
            } else {
                console.log(`⚡Server closed successfully!`);
                disconnectDb()
                    .then(() => {
                        console.log(`⚡MongoDb connections closed successfully!`);
                        process.exit(0);
                    })
                    .catch(() => {
                        console.log('❌ Closing the MongoDb connections was failed!');
                        process.exit(1);
                    });
            }
        });
    } else {
        disconnectDb()
            .then(() => {
                console.log(`⚡MongoDb connections closed successfully!`);
                process.exit(0);
            })
            .catch(() => {
                console.log('❌ Closing the MongoDb connections was failed!');
                process.exit(1);
            });
    }
}

process.on('uncaughtException', err => {
    console.log('❌ UNCAUGHT EXCEPTION ❌');
    console.log(err);
    shutDownGracefully();
});

process.on('unhandledRejection', err => {
    console.log('❌ UNHANDLED REJECTION ❌');
    console.log(err);
    shutDownGracefully();
});

process.on('SIGINT', () => {
    console.log('⚠️  SIGINT RECEIVED ⚠️');
    shutDownGracefully();
});

process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM RECEIVED ⚠️');
    shutDownGracefully();
});
