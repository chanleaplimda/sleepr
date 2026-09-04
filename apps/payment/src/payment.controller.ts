import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentCreateChargeDto } from './dto/payment-create-charge.dto';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('create_charge')
  @UsePipes(new ValidationPipe())
  async createPaymentIntent(@Payload() dto: PaymentCreateChargeDto) {
    return this.paymentService.createCharge(dto);
  }

  @EventPattern('cancel_charge')
  cancelCharge(@Payload() payload: { chargeId: string }) {
    return this.paymentService.cancelCharge(payload);
  }
}
