import { getModelToken } from '@nestjs/mongoose'
import { Test, type TestingModule } from '@nestjs/testing'
import { ReservationDocument } from './models/reservation.schema'
import { ReservationRepository } from './reservation.repository'
import { ReservationsController } from './reservations.controller'
import { ReservationsService } from './reservations.service'

describe('ReservationsController', () => {
  let controller: ReservationsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        ReservationsService,
        ReservationRepository,
        {
          provide: getModelToken(ReservationDocument.name),
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<ReservationsController>(ReservationsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
