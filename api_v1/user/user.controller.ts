import { Request } from 'express';
import { remove } from 'fs-extra';
import path from 'path';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/error/AppError';
import GetAllDocuments from '../../utils/getAllDocuments';
import { changePasswordBodyValidator } from './schema/user.bodyValidator';
import UserModel from './schema/user.model';

export const getUsers = catchAsync(async (req, res) => {
    const criteria: Record<string, unknown> = {};
    if (req.query.email) {
        criteria.email = { $regex: req.query.email, $options: 'i' };
        delete req.query.email;
    }

    const getAllDocs = await GetAllDocuments.getInstance(
        UserModel,
        req.query,
        criteria
    );
    const users = await getAllDocs.run();
    const totalResults = await getAllDocs.countDocuments();

    res.status(200).json({
        status: 'success',
        results: users.length,
        totalResults,
        data: users
    });
});

export const changePassword = catchAsync(async (req, res) => {
    await changePasswordBodyValidator.validateAsync(req.body);

    const {
        oldPassword,
        newPassword,
        newPasswordConfirmation
    }: { oldPassword: string; newPassword: string; newPasswordConfirmation: string } =
        req.body;

    if (newPassword !== newPasswordConfirmation) {
        throw new AppError(400, 'Password and passwordConfirmation must be equal!');
    }

    const user = await UserModel.findById(req.user!.id).select('+password');

    if (!user) throw AppError.notFound('User');

    if (!(await user!.checkPassword(oldPassword))) {
        throw new AppError(401, 'The old password is not correct!');
    }

    user!.password = newPassword;
    await user!.save();

    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully!'
    });
});

export const updateAvatarURL = catchAsync(
    async (
        req: Request & { user?: { id: string; role: 'admin' | 'user' } } & {
            uploadedImagesLinks?: string[];
        },
        res
    ) => {
        const user = await UserModel.findById(req.user?.id);

        if (!user) throw AppError.notFound('User');

        if (user.avatarURL) {
            await remove(path.join(process.env.AVATAR_DIR!, user.avatarURL));
        }

        user.avatarURL = req.uploadedImagesLinks![0];

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Avatar changed successfully!',
            data: user
        });
    }
);

export const deactivateUser = catchAsync(async (req, res) => {
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { isActive: false },
        { new: true, runValidators: true }
    );

    if (!updatedUser) throw AppError.notFound('User');

    res.status(200).json({
        status: 'success',
        message: 'The user account is deactivated successfully!',
        data: updatedUser
    });
});

export const activateUser = catchAsync(async (req, res) => {
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { isActive: true },
        { new: true, runValidators: true }
    );

    if (!updatedUser) throw AppError.notFound('User');

    res.status(200).json({
        status: 'success',
        message: 'The user account is activated successfully!',
        data: updatedUser
    });
});
