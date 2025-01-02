import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { User } from '../interface/interface';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES || '1h';
const cookieExpiresInDays = parseInt(
  process.env.JWT_COOKIE_EXPIRES_IN || '1',
  10,
);

const signToken = (id: string) => {
  return jwt.sign({ id }, secret, {
    expiresIn,
  });
};

export const createToken = (user: User, statusCode: number, res: Response) => {
  const jwtToken: string = signToken(user.id);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
  };
  res.cookie('jwt', jwtToken, cookieOptions);

  user.password = undefined; //not exposing the users password.
  res.status(statusCode).json({
    statusCode: statusCode,
    status: 'success',
    jwtToken,
    data: {
      user,
    },
  });
};
