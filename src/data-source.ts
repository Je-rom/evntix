import { DataSource } from 'typeorm';
import { Task } from './entity/tasks.entity';
import { Auth } from './auth/auth.entity';
import dotenv from 'dotenv';

dotenv.config();

//db connection
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Task, Auth],
  synchronize: true,
});
