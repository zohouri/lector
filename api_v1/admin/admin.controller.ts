import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/error/AppError';
import { changePasswordBodyValidator } from './schema/admin.bodyValidator';
import AdminModel from './schema/admin.model';

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

    const admin = await AdminModel.findById(req.user!.id).select('+password');

    if (!admin) throw AppError.notFound('Admin');

    if (!(await admin.checkPassword(oldPassword))) {
        throw new AppError(401, 'The old password is not correct!');
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully!'
    });
});
