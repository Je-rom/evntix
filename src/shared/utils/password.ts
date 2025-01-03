import * as bcrypt from 'bcrypt';

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
