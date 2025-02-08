import { User } from './user.entity';
import { AppDataSource } from '../data-source';
import { AppError } from '../utils/response';
import { AuthenticatedRequest } from '../interface/interface';
import { NextFunction } from 'express';
import { Repository } from 'typeorm';
class UserService {
  private userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  //find an existing user or create a new one
  public async findOrCreate(
    query: { googleId: string },
    userDetails: Partial<User>,
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { googleId: query.googleId },
    });

    //if user does not exist, create a new one: use case for google Oauth
    if (!user) {
      user = this.userRepository.create({
        googleId: query.googleId,
        ...userDetails,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  //find user by id
  public async findById(id: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.password = undefined;
      user.passwordChangedAt = undefined;
    }
    return user;
  }

  //find all users
  public async getAllUser(): Promise<User[] | null> {
    const user = await this.userRepository.find();
    if (user) {
      user.forEach((user: User) => {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.password = undefined;
        user.passwordChangedAt = undefined;
      });
    }
    return user;
  }

  //get my profile
  public async getMyProfile(
    req: AuthenticatedRequest,
    next: NextFunction,
  ): Promise<Partial<User>> {
    const authenticatedUserId = req.user?.id;
    if (!authenticatedUserId) {
      throw new AppError('User is not authenticated', 401);
    }
    const me = await this.userRepository.findOne({
      where: { id: authenticatedUserId },
      select: ['id', 'first_name', 'second_name', 'email', 'active', 'role'],
    });

    if (!me) {
      throw new AppError('Profile not found', 404);
    }

    return me;
  }

  //update user
  public async updateUser(
    updateUser: Partial<User>,
    req: AuthenticatedRequest,
  ): Promise<Partial<User> | null> {
    const authenticatedUserId = req.user?.id;

    if (updateUser.id !== authenticatedUserId) {
      throw new AppError('You can only update your own account', 403);
    }
    const existingUser = await this.userRepository.findOne({
      where: { id: updateUser.id },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    if (updateUser.password || updateUser.role) {
      throw new AppError('You cant update your password or role', 400);
    }

    if (!updateUser.id) {
      throw new AppError('User ID is required', 404);
    }
    await this.userRepository.update(updateUser.id, updateUser);
    const updatedUser = await this.userRepository.findOne({
      where: { id: updateUser.id },
    });
    if (updatedUser) {
      updatedUser.passwordResetToken = undefined;
      updatedUser.passwordResetExpires = undefined;
      updatedUser.password = undefined;
      updatedUser.passwordChangedAt = undefined;
    }
    return updatedUser ? { ...updatedUser } : null;
  }
}

export const userService = new UserService();
