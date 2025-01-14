import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error('Error:', err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = err instanceof AppError ? err.status : 'error';
  const message =
    err instanceof AppError ? err.message : 'An unexpected error occurred';

  res.status(statusCode).json({
    statusCode,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack?.split('\n'),
    }),
  });
};

export default globalErrorHandler;
