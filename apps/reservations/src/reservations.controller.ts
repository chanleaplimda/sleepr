import {
  CurrentUser,
  JwtAuthGuard,
  ResponseMessage,
  type UserDto,
} from '@app/common'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateReservationDto } from './reservations/dto/create-reservation.dto'
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto'
import { ReservationsService } from './reservations.service'

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ResponseMessage('Reservation created successfully')
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() _user: UserDto,
  ) {
    return this.reservationsService.create(createReservationDto, _user._id)
  }

  @Get()
  @ResponseMessage('Reservations retrieved successfully')
  findAll() {
    return this.reservationsService.findAll()
  }

  @Get(':id')
  @ResponseMessage('Reservation retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id)
  }

  @Patch(':id')
  @ResponseMessage('Reservation updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto)
  }

  @Delete(':id')
  @ResponseMessage('Reservation deleted successfully')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id)
  }
}
