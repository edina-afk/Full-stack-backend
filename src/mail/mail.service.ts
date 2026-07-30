import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendOtp(email: string, otp: string) {
    // Development mode: don't send email
    if (process.env.NODE_ENV !== 'production') {
      console.log('================================');
      console.log(`OTP for ${email}: ${otp}`);
      console.log('================================');
      return;
    }

    // Production: send real email
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