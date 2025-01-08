import { NextFunction, Request, Response } from 'express';
import { createToken } from './jwt.strategy';
import { User } from '../user/user.entity';
import { AppDataSource } from '../data-source';
import {
  hashPassword,
  comparePassword,
  passwordResetToken,
} from '../utils/password';
import { AppError } from '../utils/response';
import { NotificationService } from '../notifications/notification.service';
import crypto from 'crypto';

export class AuthController {
  constructor(
    private userRepository = AppDataSource.getRepository(User),
    private notification = new NotificationService(),
  ) {}

  //signup
  public signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { first_name, second_name, email, password } = req.body;

      //check if user exists
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('User already exists with that email', 400);
      }

      //hash user password
      const hashedPassword = await hashPassword(password);

      //create user
      const newUser = await this.userRepository.create({
        first_name,
        second_name,
        email,
        password: hashedPassword,
      });

      //save user
      const saveUser = await this.userRepository.save(newUser);
      //send token, with the user object
      createToken(saveUser, 201, res, 'Registered successfully');
      return;
    } catch (error) {
      console.error('Error signing up user:', error);
      next(error);
      return;
    }
  };

  //login
  public signIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      //check if user exists
      const ifUserExist = await this.userRepository.findOne({
        where: { email },
      });
      if (!ifUserExist) {
        throw new AppError('User does not exists with that email', 404);
      }

      //check if there am email or password
      if (!ifUserExist.email) {
        throw new AppError('Email is missing for the user', 400);
      }

      if (!ifUserExist.password) {
        throw new AppError('Password is missing for the user', 400);
      }

      //check if passowrd is correct
      const ifPasswordIsCorrect = await comparePassword(
        password,
        ifUserExist.password,
      );
      if (!ifPasswordIsCorrect) {
        throw new AppError('Invalid Password, please try again', 400);
      }

      //send token, with the user object
      createToken(ifUserExist, 200, res, 'Login Succesfull');
      return;
    } catch (error) {
      console.error('Error signing in user:', error);
      next(error);
    }
  };

  //forgot password
  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Please enter your email', 400);
      }

      // check if user exists
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new AppError('User does not exist', 404);
      }

      // generate token
      const resetToken = await passwordResetToken(user);

      // send email to user
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
      const message = `Forgot password? Make a request with your new password and confirm password to: ${resetURL}.\nIf you didn't make this request, please ignore it.`;

      await this.notification.sendMail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message,
      });
      await this.userRepository.save(user);
      res.status(200).json({
        status: 'success',
        message: 'Token sent to your email!',
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await this.userRepository.findOne({
        where: {
          passwordResetToken: userToken,
          passwordResetExpires: new Date(),
        },
      });

      if (!user) {
        throw new AppError(
          'Reset Token has expired or it is invalid, try again',
          400,
        );
      }
      user.password = await hashPassword(req.body.password);
      user.passwordResetExpires = undefined;
      user.passwordResetToken = undefined;
      await this.userRepository.save(user);
      createToken(
        user,
        201,
        res,
        'Your password has been restted successfully',
      );
    } catch (error) {
      next(error);
      return;
    }
  };

  public updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { currentPassword, password: newPassword } = req.body;

      // Check user by their ID
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new AppError('User not found', 400);
      }

      // Check if the current password is provided
      if (!currentPassword) {
        throw new AppError('Please provide your current password', 400);
      }

      if (!user.password) {
        throw new AppError('Please provide your  password', 400);
      }

      // Verify the current password
      const isPasswordCorrect = await comparePassword(
        currentPassword,
        user.password,
      );
      if (!isPasswordCorrect) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash the new password before saving
      user.password = await hashPassword(newPassword);

      // Save the updated user information
      await this.userRepository.save(user);

      // Send response with a new token
      createToken(
        user,
        200,
        res,
        'Your password has been updated successfully',
      );
    } catch (error) {
      next(error);
      return;
    }
  };
}

export const authController = new AuthController();
