import { Router } from 'express';
import { authController } from './auth.controller';
import { JwtAuthGuard } from '../auth/guards';

export const authRouter = Router();

authRouter.route('/register').post(authController.signUp);
authRouter.route('/login').post(authController.signIn);
authRouter.route('/forgot-password').post(authController.forgotPassword);
authRouter.route('/reset-password/:token').patch(authController.resetPassword);
authRouter
  .route('/update-password/:id')
  .patch(JwtAuthGuard, authController.updatePassword);
