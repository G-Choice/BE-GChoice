// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe = new Stripe('sk_test_51OuEF7Ex4IqeBbkk71wtUdEi2UYWoyCmDqhT9DJR5TlGUukSl4MwIO0B3mcgsG5FDd6sVLVhODcLbATU8FqkGMDh00DBcMu9Op');

  async createPaymentIntent(amount: number) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent.client_secret;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}