import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateChargeDto } from './dto/create-charge.dto';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {},
    );
  }
  async createCharge({ amount }: CreateChargeDto) {
    const paymentIntend = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: 'pm_card_visa',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      confirm: true,
    }); 
    return paymentIntend;
  }
}
