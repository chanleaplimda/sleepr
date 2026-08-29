import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreateChargeDto } from './dto/create-charge.dto';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('create_charge')
  @UsePipes(new ValidationPipe())
  async createPaymentIntent(@Payload() dto: CreateChargeDto) {
    return this.paymentService.createCharge(dto);
  }
}
