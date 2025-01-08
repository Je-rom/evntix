import { validate } from 'class-validator';
import { AppError } from './response';

export const validateEntity = async (entity: object) => {
  const errors = await validate(entity);
  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => Object.values(err.constraints || {}))
      .flat();
    throw new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400);
  }
};
