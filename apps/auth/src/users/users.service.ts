import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { CreateUserDTO } from './dto/create-user.dto'
import { UserRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}
  async create(createUserDto: CreateUserDTO) {
    await this.validateCreateUser(createUserDto)
    return this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    })
  }
  async getUser() {
    const user = await this.usersRepository.find({})
    return user
  }

  async validateCreateUser(createUserDto: CreateUserDTO) {
    const user = await this.usersRepository.findOne({
      email: createUserDto.email,
    })
    if (user) {
      throw new UnauthorizedException('User already exists')
    }
  }
  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email })
    if (!user) {
      throw new UnauthorizedException()
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException()
    }
    return user
  }
}
