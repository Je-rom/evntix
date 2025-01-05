import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { EventStatus } from '../shared/enums/enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Event title is required' })
  @IsString({})
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Event description is required' })
  @IsString({})
  description: string;

  @Column({ type: 'date' })
  @IsNotEmpty({ message: 'Event date is required' })
  @IsDateString()
  date: Date 

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Event location is required' })
  @IsString()
  location: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PENDING })
  @IsNotEmpty({ message: 'Event status is required' })
  @IsEnum(EventStatus)
  status: EventStatus;

  @Column({ type: 'bytea', nullable: true })
  event_image: Buffer;

  @Column({ type: 'integer', nullable: true })
  @IsNotEmpty({ message: 'Event capacity is required' })
  @IsInt()
  @Min(1, { message: 'Event capacity must be at least 1' })
  capacity: number;
}
