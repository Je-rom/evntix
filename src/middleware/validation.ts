import { body, ValidationChain, validationResult } from 'express-validator';
import { Priority, Status } from '../enums/enum';
import { NextFunction, Request, Response } from 'express';

//reusable middleware to handle validation results
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const taskValidator: ValidationChain[] = [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required')
    .trim()
    .isString()
    .withMessage('Title must be a string'),
  body('date')
    .not()
    .isEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a date'),
  body('description')
    .not()
    .isEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string'),
  body('priority')
    .not()
    .isEmpty()
    .withMessage('Priority is required')
    .isIn(Object.values(Priority))
    .withMessage(
      'Priority must be one of: ' + Object.values(Priority).join(', '),
    ),
  body('status')
    .not()
    .isEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(Status))
    .withMessage('Status must be one of: ' + Object.values(Status).join(', ')),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const signupValidator: ValidationChain[] = [
  body('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),

  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  body('firstName')
    .not()
    .isEmpty()
    .withMessage('First name is required')
    .isString()
    .withMessage('First name must be a string')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),

  body('secondName')
    .not()
    .isEmpty()
    .withMessage('Second name is required')
    .isString()
    .withMessage('Second name must be a string')
    .isLength({ min: 2 })
    .withMessage('Second name must be at least 2 characters long')
    .isLength({ max: 50 })
    .withMessage('Second name must not exceed 50 characters'),
];
