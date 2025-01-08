export interface User {
  id: string;
  email?: string;
  firstName?: string;
  secondName?: string;
  password?: string;
  //   [key: string]: any;
}

export interface MailOptions {
  email: string;
  subject: string;
  message: string;
}
