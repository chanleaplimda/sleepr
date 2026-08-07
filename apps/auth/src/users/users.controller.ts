import { Body, Controller, Get, Post } from '@nestjs/common'
import { CreateUserDTO } from './dto/create-user.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO) {
    const user = await this.usersService.create(createUserDto)
    return user
  }
  @Get()
  async getUser() {
    const user = await this.usersService.getUser()
    return user
  }
}
