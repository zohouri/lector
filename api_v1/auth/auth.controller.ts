import { CookieOptions, NextFunction, Request, Response } from 'express';
import {
    sign,
    verify,
    Secret,
    SignOptions,
    JwtPayload,
    VerifyOptions
} from 'jsonwebtoken';
import { promisify } from 'util';
import { Document } from 'mongoose';
import UserModel from '../user/schema/user.model';
import { UserType } from '../user/schema/user.type';
import AdminModel from '../admin/schema/admin.model';
import AppError from '../../utils/error/AppError';
import catchAsync from '../../utils/catchAsync';
import AdminType from '../admin/schema/admin.type';
import {
    loginAdminBodyValidator,
    loginUserBodyValidator,
    userSignupBodyValidator
} from './schema/auth.bodyValidator';

const asyncJwtSign = promisify<object, Secret, SignOptions, string>(sign);
const asyncJwtVerify = promisify<string, Secret, VerifyOptions, JwtPayload>(verify);

const createSendAccessToken = async (userId: string, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const accessToken = await asyncJwtSign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        algorithm: 'HS256'
    });

    const cookieOptions: CookieOptions = {
        maxAge: Number(process.env.JWT_COOKIE_MAX_AGE),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'strict';
    }
    res.cookie('accessToken', accessToken, cookieOptions);

    res.status(200).json({
        status: 'success',
        message: 'You logged in successfully.',
        accessToken
    });
};

export const loginAdmin = catchAsync(async (req, res) => {
    await loginAdminBodyValidator.validateAsync(req.body);

    const { username, password }: { username: string; password: string } = req.body;

    const admin = await AdminModel.findOne({ username }).select('+password');

    if (!admin || !(await admin.checkPassword(password))) {
        throw new AppError(401, 'Username or password is incorrect!');
    }

    if (!admin.isActive) {
        throw new AppError(403, 'Your account has been deactivated!');
    }

    await createSendAccessToken(admin.id, res);
});

export const userSignup = catchAsync(async (req, res) => {
    await userSignupBodyValidator.validateAsync(req.body);

    const {
        email,
        password,
        passwordConfirmation
    }: {
        email: string;
        password: string;
        passwordConfirmation: string;
    } = req.body;

    if (password !== passwordConfirmation) {
        throw new AppError(400, 'Password and passwordConfirmation must be equal!');
    }

    const newUser = await UserModel.create({ email, password });

    await createSendAccessToken(newUser.id, res);
});

export const loginUser = catchAsync(async (req, res) => {
    await loginUserBodyValidator.validateAsync(req.body);

    const { email, password }: { email: string; password: string } = req.body;

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password))) {
        throw new AppError(401, 'Email or password is incorrect!');
    }

    if (!user.isActive) {
        throw new AppError(403, 'Your account has been deactivated!');
    }

    await createSendAccessToken(user.id, res);
});

export const logout = catchAsync(async (req, res) => {
    const cookieOptions: CookieOptions = {
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'strict';
    }
    res.clearCookie('accessToken', cookieOptions);

    res.status(200).json({
        status: 'success',
        message: 'You logged out successfully.'
    });
});

export const protect = catchAsync(async (req, res, next) => {
    let token = '';
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        throw new AppError(401, 'You are not logged in!');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decoded = await asyncJwtVerify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256']
    });

    let currentUser: ((AdminType | UserType) & Document) | null;
    if (process.env.PRIVILEGE === 'admin') {
        currentUser = await AdminModel.findById(decoded.userId).select(
            '+passwordChangedAt'
        );
    } else {
        currentUser = await UserModel.findById(decoded.userId).select(
            '+passwordChangedAt'
        );
    }

    if (!currentUser) {
        throw new AppError(401, 'You are not logged in!');
    }

    if (!currentUser.isActive) {
        throw new AppError(403, 'Your account has been deactivated!');
    }

    if (currentUser.changedPasswordAfter(decoded.iat || 0)) {
        throw new AppError(401, 'Your password has been changed. Please log in again!');
    }

    req.user = {
        id: currentUser.id,
        role: currentUser instanceof AdminModel ? 'admin' : 'user'
    };

    next?.();
});

export const restrictTo =
    (...roles: Array<'admin' | 'user'>) =>
    (
        req: Request & { user?: { id: string; role: 'admin' | 'user' } },
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            throw new AppError(401, 'You are not logged in!');
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(403, 'You do not have access to perform this operation!')
            );
        }

        next();
    };
