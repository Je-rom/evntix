import { Router } from 'express';
import { userController } from './user.controller';
import { JwtAuthGuard } from '../auth/guards';

export const userRouter = Router();

userRouter.route('/me').get(JwtAuthGuard, userController.getMyProfile);
userRouter.route('/').get(JwtAuthGuard, userController.getAllUsers);
userRouter.route('/:id').get(JwtAuthGuard, userController.findById);
userRouter.route('/:id').patch(JwtAuthGuard, userController.updatedUser);
