import { getModelToken } from '@nestjs/mongoose'
import { Test, type TestingModule } from '@nestjs/testing'
import { ReservationDocument } from './models/reservation.schema'
import { ReservationRepository } from './reservation.repository'
import { ReservationsService } from './reservations.service'

describe('ReservationsService', () => {
  let service: ReservationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        ReservationRepository,
        {
          provide: getModelToken(ReservationDocument.name),
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ReservationsService>(ReservationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
