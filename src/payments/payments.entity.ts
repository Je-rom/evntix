import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TicketPrice } from '../tickets/tickets.entity';
import { Event } from '../events/event.entity';
import { User } from '../user/user.entity';
import { PaymentStatus, WebhookStatus } from '../enums/enum';
import { IsEnum } from 'class-validator';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => TicketPrice, (ticket) => ticket.payments)
  ticket: TicketPrice;

  @ManyToOne(() => Event, (event) => event.payments)
  event: Event;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @Column({ type: 'text', unique: true })
  paystack_reference: string;

  @Column({ type: 'jsonb', nullable: true })
  paystack_response?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  webhook_payload?: Record<string, any>;

  @Column({ type: 'enum', enum: WebhookStatus, default: WebhookStatus.PENDING })
  @IsEnum(WebhookStatus)
  webhook_status: WebhookStatus;

  @Column({ type: 'text' })
  authorization_url: string;

  @Column({ type: 'text', nullable: true })
  payment_method?: string;

  @Column({ type: 'text', default: 'NGN' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fees?: number;

  @Column({ type: 'text', nullable: true })
  paystack_customer_id?: string;

  @Column({ type: 'text', nullable: true })
  payer_email?: string;

  @Column({ type: 'int', default: 0 })
  retry_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  webhook_received_at?: Date;

  @Column({ type: 'text', nullable: true })
  webhook_failure_reason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
