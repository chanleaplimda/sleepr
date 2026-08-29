import { PAYMENT_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';
import { ReservationRepository } from './reservation.repository';
import { CreateReservationDto } from './reservations/dto/create-reservation.dto';
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}
  async create(createReservationDto: CreateReservationDto, userId: string) {
    return this.paymentService
      .send('create_charge', createReservationDto.createCharge)
      .pipe(
        map((response) => {
          return this.reservationRepository.create({
            ...createReservationDto,
            invoiceId: response.id,
            timestamp: new Date(),
            userId,
          });
        }),
      );
  }
  findAll() {
    return this.reservationRepository.find({});
  }
  findOne(_id: string) {
    return this.reservationRepository.findOne({ _id });
  }
  update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationRepository.findOneAndUpdate(
      { _id },
      updateReservationDto,
    );
  }
  remove(_id: string) {
    return this.reservationRepository.deleteOne({ _id });
  }
}
