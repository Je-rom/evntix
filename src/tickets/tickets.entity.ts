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
import { IsDecimal, IsEnum, IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class TicketPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.ticket_prices)
  event: Event;

  @Index()
  @Column({ type: 'enum', enum: TicketType })
  @IsNotEmpty({ message: 'Please add a ticket type' })
  @IsEnum(TicketPrice)
  ticket_type: TicketType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNotEmpty({ message: 'Please add an amount' })
  @IsDecimal({})
  price: number;

  @Column({ type: 'text', nullable: true })
  @IsString({ message: 'Day must be a string' })
  day?: string;

  @CreateDateColumn({ type: 'date' })
  created_At: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_At: Date;
}
