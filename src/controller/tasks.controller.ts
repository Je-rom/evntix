import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Task } from '../entity/tasks.entity';
import { instanceToPlain } from 'class-transformer';
import { AppError } from '../shared/utils/response';

class TasksController {
  constructor(private taskRepository = AppDataSource.getRepository(Task)) {}

  //get all tasks
  public getAllTasks = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const tasks = await this.taskRepository.find({
        order: { date: 'ASC' },
      });
      const plainTasks = instanceToPlain(tasks);
      res.status(200).json(plainTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      next(error);
    }
  };

  //create task
  public createTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { title, date, description, priority, status } = req.body;

      const existingTask = await this.taskRepository.findOne({
        where: { title },
      });
      if (existingTask) {
        throw new AppError('Task already exists with that title', 400);
      }

      // Create a task instance
      const task = await this.taskRepository.create({
        title,
        date,
        description,
        priority,
        status,
      });

      // Save the task to the database
      const newTask = await this.taskRepository.save(task);

      res.status(201).json({
        status: 'success',
        message: 'Task successfully created',
        data: { task: newTask },
      });
    } catch (error) {
      console.error('Error creating task:', error);
      next(error);
    }
  };

  //update task
  public updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const updateTask = await this.taskRepository.update(
        req.params.id,
        req.body,
      );

      if (!updateTask.affected) {
        throw new AppError('Invalid task id  or task does not exist', 400);
      }

      const newTask = await this.taskRepository.findOneBy({
        id: req.params.id,
      });

      res.status(200).json({
        status: 'success',
        message: 'Task successfully updated',
        data: { task: newTask },
      });
    } catch (error) {
      console.error('Error updating task:', error);
      next(error);
    }
  };

  //delete task
  public deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const deleteTask = await this.taskRepository.delete(req.params.id);
      if (!deleteTask.affected) {
        throw new AppError('Invalid task id or task does not exist', 400);
      }
      const deletedTask = await this.taskRepository.findOneBy({
        id: req.params.id,
      });
      res.status(200).json({
        status: 'success',
        message: 'Task successfully updated',
        data: { task: deletedTask },
      });
    } catch (error) {
      console.error('Error updating task:', error);
      next(error);
    }
  };

  //get task by id
  public getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const taskId = await this.taskRepository.findOneBy({ id: req.params.id });
      if (!taskId) {
        throw new AppError('Invalid task id or task does not exist', 400);
      }
      res.status(200).json({
        status: 'success',
        message: 'Task successfully updated',
        data: { task: taskId },
      });
    } catch (error) {
      console.error('Error updating task:', error);
      next(error);
    }
  };
}

export const taskController = new TasksController();
