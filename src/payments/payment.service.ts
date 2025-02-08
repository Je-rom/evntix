import { User } from '../user/user.entity';
import { Event } from '../events/event.entity';
import { TicketPrice } from '../tickets/tickets.entity';
import { Payment } from './payments.entity';
import { PaymentStatus, WebhookStatus } from '../enums/enum';
import axios from 'axios';
import { AppDataSource } from '../data-source';
import { Repository } from 'typeorm';
import { AppError } from '../utils/response';
import { PaystackConfig } from '../config/paystack.config';
import { NextFunction } from 'express';
export class PaymentService {
  private userRepository: Repository<User>;
  private eventRepository: Repository<Event>;
  private ticketRepository: Repository<TicketPrice>;
  private paymentRepository: Repository<Payment>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.eventRepository = AppDataSource.getRepository(Event);
    this.ticketRepository = AppDataSource.getRepository(TicketPrice);
    this.paymentRepository = AppDataSource.getRepository(Payment);
  }

  async initializePayment(
    paymentData: Partial<Payment>,
    next: NextFunction,
  ): Promise<Payment> {
    const { user, event, ticket } = paymentData;

    //check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { id: user?.id },
    });
    if (!existingUser) {
      throw new AppError('User does not exist', 404);
    }
    //check if event exists
    const eventExist = await this.eventRepository.findOne({
      where: { id: event?.id },
    });
    if (!eventExist) {
      throw new AppError('Event does not exist', 404);
    }

    //check if ticket exist
    const ticketExist = await this.ticketRepository.findOne({
      where: { id: ticket?.id },
    });
    if (!ticketExist) {
      throw new AppError('Ticket does not exist', 404);
    }

    //payment amount
    const amount = ticketExist.price ? ticketExist.price * 100 : 0;
    //generate a unique reference
    const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentPayload = {
      email: existingUser.email,
      amount: amount,
      currency: 'NGN',
      callback_url: `${PaystackConfig.url}`,
      reference,
      metadata: {
        user_id: existingUser.id,
        event_id: eventExist.id,
        ticket_id: ticketExist.id,
      },
    };
    console.log(paymentPayload.callback_url, 'kwkew');

    try {
      const pay = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${PaystackConfig.secretKey}`,
          },
        },
      );
      if (!pay.data.status) {
        throw new AppError('Failed to initialize payment with Paystack', 500);
      }

      const payment = await this.paymentRepository.create({
        user: existingUser,
        event: eventExist,
        ticket: ticketExist,
        amount,
        status: PaymentStatus.PENDING,
        paystack_reference: reference,
        authorization_url: pay.data.data.authorization_url,
        currency: 'NGN',
        retry_attempts: 0,
        webhook_status: WebhookStatus.PENDING,
        payer_email: existingUser.email,
      });
      const savedPayment = await this.paymentRepository.save(payment);
      return savedPayment;
    } catch (error) {
      console.error('Error during payemnt initialization:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new AppError(
          error.response.data.message || 'Paystack API Error',
          502,
        );
      }
      if (error instanceof AppError) {
        next(error);
      }
      throw new AppError('Unexpected error during payment initialization', 500);
    }
  }
}
