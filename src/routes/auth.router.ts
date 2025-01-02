import { Router } from 'express';
import { authController } from '../controller/auth.controller';
import {
  loginValidator,
  signupValidator,
  validateRequest,
} from '../middleware/validation';

export const authRouter = Router();

authRouter
  .route('/register')
  .post(signupValidator, validateRequest, authController.signUp);
authRouter
  .route('/login')
  .post(loginValidator, validateRequest, authController.signIn);
