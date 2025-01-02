import { Router } from 'express';
import { taskController } from '../controller/tasks.controller';
import { taskValidator, validateRequest } from '../middleware/validation';

export const taskRouter = Router();

taskRouter
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskValidator, validateRequest, taskController.createTask);

taskRouter
  .route('/:id')
  .get(taskController.getTaskById)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);
