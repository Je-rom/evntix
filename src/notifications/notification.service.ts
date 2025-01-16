import sgMail from '@sendgrid/mail';
// import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
// import { MailOptions } from '../interface/interface';

if (!process.env.eventixTupac) {
  throw new Error('SENDGRID_API_KEY is not defined');
}

const defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || '';
sgMail.setApiKey(process.env.eventixTupac);

export class NotificationService {
  public sendEmail = async (
    to: string,
    subject: string,
    text: string,
    options?: {},
  ): Promise<{ success: boolean; message: string }> => {
    const message = {
      to,
      from: defaultFromEmail,
      subject,
      text,
      ...options,
    };

    try {
      await sgMail.send(message);
      return { success: true, message: 'Email sent successfully' };
    } catch (error: any) {
      console.error('Error sending email:', error);
      let errorMessage = 'Failed to send email';
      if (error.response && error.response.body && error.response.body.errors) {
        errorMessage = error.response.body.errors
          .map((err: any) => err.message)
          .join(', ');
      }
      return { success: false, message: errorMessage };
    }
  };

  // public sendMail = async (options: MailOptions): Promise<void> => {
  //   const transporter: Transporter = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: Number(process.env.EMAIL_PORT),
  //     auth: {
  //       user: process.env.EMAIL_USERNAME!,
  //       pass: process.env.EMAIL_PASSWORD!,
  //     },
  //   });

  //   const mailOptions: SendMailOptions = {
  //     from: 'Evntix<evntix@gmail.com>',
  //     to: options.email,
  //     subject: options.subject,
  //     text: options.message,
  //   };

  //   await transporter.sendMail(mailOptions);
  // };
}
