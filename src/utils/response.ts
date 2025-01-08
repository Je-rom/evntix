import { Response } from 'express';

export class ResponseUtil {
  static success(
    res: Response,
    {
      message = 'Request successful',
      data = null,
      statusCode = 200,
    }: {
      message?: string;
      data?: any;
      statusCode?: number;
    },
  ): Response {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  static error(
    res: Response,
    {
      message = 'An error occurred',
      error = null as any,
      statusCode = 500,
    } = {},
  ) {
    return res.status(statusCode).json({
      status: 'error',
      message,
      error: error ? error.message || error : null,
    });
  }

  static validationError(
    res: Response,
    {
      message = 'Validation errors occurred',
      errors = [],
      statusCode = 400,
    } = {},
  ) {
    return res.status(statusCode).json({
      status: 'error',
      message,
      errors,
    });
  }
}

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.status = 'fail';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500);
    this.status = 'error';
  }
}
