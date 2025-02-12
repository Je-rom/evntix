import { PaymentService } from './payment.service';
import { NextFunction, Request, Response } from 'express';

export class PaymentController {
  private paymentService = PaymentService;

  createPayment = async (): => {};
}
