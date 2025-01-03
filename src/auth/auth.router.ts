import { Router } from 'express';
import { authController } from './auth.controller';

export const authRouter = Router();

authRouter.route('/register').post(authController.signUp);
authRouter.route('/login').post(authController.signIn);
