import { CurrentUser, ResponseMessage, UserDocument } from '@app/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('User created successfully')
  async create(@Body() createUserDto: CreateUserDTO) {
    const user = await this.usersService.create(createUserDto);
    return user;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('User retrieved successfully')
  async getUser(@CurrentUser() user: UserDocument) {
    return user;
  }
}
