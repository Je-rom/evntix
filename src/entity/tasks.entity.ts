import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Priority, Status } from '../enums/enum';
import { IsNotEmpty, IsEnum, IsString, IsDateString } from 'class-validator';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Please add a title for this task' })
  @IsString()
  title: string;

  @Column({ type: 'date' })
  @IsNotEmpty({ message: 'Please add a date for this task' })
  @IsDateString()
  date: Date;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Please add a description for this task' })
  description: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.normal })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'enum', enum: Status, default: Status.todo })
  @IsEnum(Status)
  status: Status;
}
