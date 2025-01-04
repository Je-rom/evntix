import { User } from './user.entity';
import { AppDataSource } from '../data-source';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  //find an existing user or create a new one
  public async findOrCreate(
    query: { googleId: string },
    userDetails: Partial<User>,
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { googleId: query.googleId },
    });

    //if user does not exist, create a new one
    if (!user) {
      user = this.userRepository.create({
        googleId: query.googleId,
        ...userDetails,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  public async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}

export const userService = new UserService();
