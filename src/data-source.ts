import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Event } from './events/event.entity';
import { TicketPrice } from './tickets/tickets.entity';
import { Payment } from './payments/payments.entity';
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
  entities: [User, Event, TicketPrice, Payment],
  synchronize: true,
});
