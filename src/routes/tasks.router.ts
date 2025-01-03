import { Router } from 'express';
import { taskController } from '../controller/tasks.controller';

export const taskRouter = Router();

taskRouter
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

taskRouter
  .route('/:id')
  .get(taskController.getTaskById)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);
