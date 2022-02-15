import { Router } from 'express';
import { protect, restrictTo } from '../auth/auth.controller';
import * as adminController from './admin.controller';

const adminRouter = Router();

adminRouter.use(protect);

adminRouter
    .route('/changePassword')
    .patch(restrictTo('admin'), adminController.changePassword);

export default adminRouter;
