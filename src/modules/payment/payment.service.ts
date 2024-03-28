// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe = new Stripe('sk_test_51OuEF7Ex4IqeBbkk71wtUdEi2UYWoyCmDqhT9DJR5TlGUukSl4MwIO0B3mcgsG5FDd6sVLVhODcLbATU8FqkGMDh00DBcMu9Op');

  async createPaymentIntent(amount: number) {
    try {
      console.log('====================================');
      console.log("Aaaaaa");
      console.log('====================================');
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'vnd',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      console.log(paymentIntent);
      
      return paymentIntent.client_secret;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
