import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  //   Index,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { TicketType } from '../enums/enum';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Payment } from '../payments/payments.entity';

@Entity()
export class TicketPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.ticket_prices)
  event: Event;

  @OneToMany(() => Payment, (payment) => payment.ticket)
  payments: Payment[];

  //   @Index()
  @Column({ type: 'enum', enum: TicketType })
  @IsNotEmpty({ message: 'Please add a ticket type' })
  @IsEnum(TicketType)
  ticket_type: TicketType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNotEmpty({ message: 'Please add an amount' })
  @IsDecimal({})
  price?: number | undefined;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Day must be a string' })
  day?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_At: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_At: Date;
}
