import { User } from './user.entity';
import { userService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../interface/interface';
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
        res.status(404).json({ status: false, message: 'User not found' });
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
      res.status(200).json({
        status: true,
        message: 'Successful',
        result: allUsers,
      });
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
          message: 'User update successfully',
          result: updateUser,
        });
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
