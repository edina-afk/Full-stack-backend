import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend?: Resend;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      const key = process.env.RESEND_API_KEY;
      if (!key) {
        throw new Error(
          'RESEND_API_KEY is required in production environment',
        );
      }

      this.resend = new Resend(key);
    }
  }

  async sendOtp(email: string, otp: string) {
    // Development mode: don't send email
    if (process.env.NODE_ENV !== 'production') {
      console.log('================================');
      console.log(`OTP for ${email}: ${otp}`);
      console.log('================================');
      return;
    }
    // Production: send real email
    if (!this.resend) {
      throw new Error('Resend client not initialized');
    }

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your OTP Code',
      html: `
        <h2>Your verification code</h2>
        <h1>${otp}</h1>
        <p>This code expires soon.</p>
      `,
    });
  }
}