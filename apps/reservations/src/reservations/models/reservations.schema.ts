import { AbstractDocument } from '@app/common/database/abstract.schema'
import { Schema } from '@nestjs/mongoose'

@Schema({ versionKey: false })
export class ReservationDocument extends AbstractDocument {
  timestamp: Date
  startDate: Date
  endDate: Date
  userId: string
  placeId: string
}
