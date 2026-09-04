import { PAYMENT_SERVICE, type UserDto } from '@app/common'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { switchMap } from 'rxjs'
import { ReservationRepository } from './reservation.repository'
import { CreateReservationDto } from './reservations/dto/create-reservation.dto'
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto'

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    { email, _id: userId }: UserDto,
  ) {
    return this.paymentService
      .send('create_charge', {
        ...createReservationDto.createCharge,
        email,
      })
      .pipe(
        switchMap(async (response) => {
          if (!response?.id) {
            throw new Error(
              'Payment service returned an invalid charge response',
            )
          }
          try {
            return await this.reservationRepository.create({
              ...createReservationDto,
              invoiceId: response.id,
              timestamp: new Date(),
              userId,
            })
          } catch (err) {
            // Compensation: the charge succeeded but the reservation could
            // not be persisted, so release the payment to avoid charging the
            // customer for a reservation that does not exist.
            this.paymentService.emit('cancel_charge', { chargeId: response.id })
            throw err
          }
        }),
      )
  }

  findAll() {
    return this.reservationRepository.find({})
  }

  findOne(_id: string) {
    return this.reservationRepository.findOne({ _id })
  }

  update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationRepository.findOneAndUpdate(
      { _id },
      updateReservationDto,
    )
  }

  remove(_id: string) {
    return this.reservationRepository.deleteOne({ _id })
  }
}
