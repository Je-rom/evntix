import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventStatus } from '../enums/enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TicketPrice } from '../tickets/tickets.entity';

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
  date: Date;

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
  free_ticket_count?: number;

  @Column({ type: 'bytea', nullable: true })
  event_image: Buffer;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Event capacity must be at least 1' })
  capacity?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_At: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_At: Date;
}
