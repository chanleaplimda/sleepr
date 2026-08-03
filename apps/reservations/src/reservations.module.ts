import { DatabaseModule, LoggerModule } from '@app/common'
import { Module } from '@nestjs/common'
import {
  ReservationDocument,
  ReservationSchema,
} from './models/reservation.schema'
import { ReservationRepository } from './reservation.repository'
import { ReservationsController } from './reservations.controller'
import { ReservationsService } from './reservations.service'

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: ReservationDocument.name, schema: ReservationSchema },
    ]),
    LoggerModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationRepository],
})
export class ReservationsModule {}
