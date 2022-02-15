import express from 'express';
import * as authController from './auth.controller';

const authRouter = express.Router();

if (process.env.PRIVILEGE === 'admin') {
    authRouter.route('/loginAdmin').post(authController.loginAdmin);
} else if (process.env.PRIVILEGE === 'user') {
    authRouter.route('/signupUser').post(authController.userSignup);
    authRouter.route('/loginUser').post(authController.loginUser);
}

authRouter.route('/logout').post(authController.protect, authController.logout);

export default authRouter;
