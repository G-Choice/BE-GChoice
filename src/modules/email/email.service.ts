import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as speakeasy from 'speakeasy';
import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`,
      });
    } catch (error) {
      console.error(`Failed to send OTP email to ${email}. Error: ${error.message}`);
      throw new HttpException(
        { message: 'Failed to send OTP email', error: error.message || 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  generateOTP(): string {
    const secret = speakeasy.generateSecret({ length: 6, name: 'G-choie' });
    const otp = speakeasy.totp({
      secret: "tjakdhh123",
      encoding: 'base32',
    });
    return otp;
  }
}
