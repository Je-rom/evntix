import { User } from './user.entity';
import { userService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../interface/interface';
import { AppError } from '../utils/response';
class UserController {
  private userService = userService;

  public findById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const user = await this.userService.findById(id);

      if (user) {
        res.status(200).json({
          status: true,
          message: 'Successful',
          user,
        });
      } else {
        throw new AppError('User not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const allUsers = await this.userService.getAllUser();
      if (allUsers) {
        res.status(200).json({
          status: true,
          message: 'Successful',
          result: allUsers,
        });
      } else {
        throw new AppError(`Couldn't find all the users`, 404);
      }
    } catch (error) {
      next(error);
    }
  };

  public updatedUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user: Partial<User> = req.body;
      const userId = req.params.id;
      user.id = userId;
      const authReq = req as AuthenticatedRequest;
      const updateUser = await this.userService.updateUser(user, authReq);
      if (updateUser) {
        res.status(200).json({
          status: true,
          message: 'User updated successfully',
          result: updateUser,
        });
      } else {
        throw new AppError('User update failed', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  // public getMyProfile = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> => {
  //   try {
  //     let userId = (req.user as User)?.id;
  //     if (!userId) {
  //       res.status(401).json({ message: 'No user profile found' });
  //     }

  //     const userProfile = await this.userService.getMyProfile(userId);
  //     res.status(200).json({
  //       status: true,
  //       message: 'User fetched successfully',
  //       result: userProfile,
  //     });
  //   } catch (error) {
  //     next(error);
  //     return;
  //   }
  // };
}

export const userController = new UserController();
