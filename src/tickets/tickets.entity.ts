import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { TicketType } from '../enums/enum';
import { IsDecimal, IsEnum, IsString } from 'class-validator';

@Entity()
export class TicketPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.ticket_prices)
  event: Event;

  @Index()
  @Column({ type: 'enum', enum: TicketType })
  @IsEnum(TicketPrice)
  ticket_type: TicketType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsDecimal({})
  price: number;

  @Column({ type: 'text' })
  @IsString({ message: 'Day must be a string' })
  day: string;

  @CreateDateColumn({ type: 'date' })
  created_At: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_At: Date;
}
