import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { EventStatus } from '../enums/enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketPrice } from '../tickets/tickets.entity';
import { User } from '../user/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.events)
  user: User;

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
  date: Date;

  @Column({ type: 'time', nullable: false })
  @IsNotEmpty({ message: 'Time is required' })
  time: string;

  @OneToMany(() => TicketPrice, (ticket_price) => ticket_price.event)
  ticket_prices: TicketPrice[];

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Event location is required' })
  @IsString()
  location: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.AVAILABLE })
  @IsEnum(EventStatus)
  status: EventStatus;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  free_ticket?: number;

  @Column({ type: 'bytea', nullable: true })
  event_image?: Buffer;

  @Column({ type: 'integer', nullable: true })
  ticket_count?: number;

  @Column({ type: 'timestamp', nullable: true })
  ticket_availability_end_date?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_At: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_At: Date;
}
