import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { User } from '../interface/interface';
import { AppError } from '../utils/response';
dotenv.config();

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

export const createToken = (
  user: Partial<User>,
  statusCode: number,
  res: Response,
  message: string,
) => {
  const jwtToken: string = signToken(user.id as string);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
  res.cookie('jwt', jwtToken, cookieOptions);

  user.password = undefined; //not exposing the users password.
  res.status(statusCode).json({
    statusCode: statusCode,
    status: 'success',
    jwtToken,
    message,
    result: {
      user,
    },
  });
};

export const verifyToken = async (jwtToken: string) => {
  try {
    return jwt.verify(jwtToken, secret);
  } catch (error) {
    throw new AppError('Invalid token', 400);
  }
};
