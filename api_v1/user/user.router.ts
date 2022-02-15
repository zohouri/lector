import { Router } from 'express';
import uploadImages from '../../utils/uploadImages';
import { protect, restrictTo } from '../auth/auth.controller';
import * as userController from './user.controller';

const userRouter = Router();

userRouter.use(protect);

userRouter.route('/').get(restrictTo('admin'), userController.getUsers);

userRouter
    .route('/changePassword')
    .patch(restrictTo('user'), userController.changePassword);

userRouter
    .route('/changeAvatar')
    .patch(
        restrictTo('user'),
        uploadImages('avatar', 1, process.env.AVATAR_DIR!),
        userController.updateAvatarURL
    );

userRouter
    .route('/:userId/deactivate')
    .patch(restrictTo('admin'), userController.deactivateUser);
userRouter
    .route('/:userId/activate')
    .patch(restrictTo('admin'), userController.activateUser);

export default userRouter;
