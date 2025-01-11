import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  secondName?: string;
  password?: string;
  role?: string
  //   [key: string]: any;
}

export interface MailOptions {
  email: string;
  subject: string;
  message: string;
}
