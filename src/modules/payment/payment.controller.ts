// src/payment/payment.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/intents')
  async createPaymentIntent(@Body() body: { amount: number }) {
    try {
      const clientSecret = await this.paymentService.createPaymentIntent(body.amount);
      return { paymentIntent: clientSecret };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
