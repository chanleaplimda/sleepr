import { NOTIFICATION_SERVICE } from '@app/common/constants'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import Stripe from 'stripe'
import { PaymentCreateChargeDto } from './dto/payment-create-charge.dto'

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationsClient: ClientProxy,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {},
    )
  }
  async createCharge({ amount, email }: PaymentCreateChargeDto) {
    const paymentIntend = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: 'pm_card_visa',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      confirm: true,
    })
    this.notificationsClient.emit('notify_email', { email })
    return paymentIntend
  }

  async cancelCharge({ chargeId }: { chargeId: string }) {
    await this.stripe.refunds.create({ payment_intent: chargeId })
  }
}
