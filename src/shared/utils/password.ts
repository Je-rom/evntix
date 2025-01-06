import * as bcrypt from 'bcrypt';
import { User } from '../../user/user.entity';
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (
  userPassword: string,
  passowrd: string,
): Promise<boolean> => {
  const comparePassword = await bcrypt.compare(userPassword, passowrd);
  return comparePassword;
};

export const changedPasswordAfter = async (
  userData: Partial<User>,
  JWTTimestamp: number,
): Promise<boolean> => {
  const passowrd = userData.passwordChangedAt;
  if (passowrd) {
    const timePasswordChanged = (passowrd.getTime() / 100, 10);
    return JWTTimestamp < timePasswordChanged;
  }
  return false;
};
