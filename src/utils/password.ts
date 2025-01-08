import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../user/user.entity';

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
    const timePasswordChanged = passowrd.getTime() / 1000;
    return JWTTimestamp < timePasswordChanged;
  }
  return false;
};

export const passwordResetToken = async (
  userData: Partial<User>,
): Promise<string> => {
  const resetToken = await crypto.randomBytes(32).toString('hex');

  userData.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  userData.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};
