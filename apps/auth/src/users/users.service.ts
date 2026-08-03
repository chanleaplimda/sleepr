import { Injectable } from '@nestjs/common'
import { CreateUserDTO } from './dto/create-user.dto'
import { UserRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}
  async create(createUserDto: CreateUserDTO) {
    return this.usersRepository.create(createUserDto)
  }
}
