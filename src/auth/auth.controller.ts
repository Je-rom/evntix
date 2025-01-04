import { User } from '../user/user.entity';
import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { createToken } from './jwt.strategy';
import { hashPassword, comparePassword } from '../shared/utils/password';
import { AppError } from '../shared/utils/response';

class AuthController {
  constructor(private userRepository = AppDataSource.getRepository(User)) {}

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
      createToken(saveUser, 201, res);
      return;
    } catch (error) {
      console.error('Error signing up user:', error);
      next(error);
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
        throw new AppError('User does not exists with that email', 400);
      }
      //check if there's a password
      if (!ifUserExist.password) {
        throw new AppError('Password is missing for the user', 400);
      }
      //check if passowrd is correct
      const ifPasswordIsCorrect = await comparePassword(
        password,
        ifUserExist.password,
      );
      if (!ifPasswordIsCorrect) {
        throw new AppError('Invalid credentials', 400);
      }

      const user = {
        id: ifUserExist.id,
        email: ifUserExist.email,
      };
      //send token, with the user object
      createToken(user, 200, res);
      return;
    } catch (error) {
      console.error('Error signing in user:', error);
      next(error);
    }
  };
}
export const authController = new AuthController();
