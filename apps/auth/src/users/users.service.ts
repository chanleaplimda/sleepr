import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../../../../libs/common/src/models/user.schema';
import { CreateUserDTO } from './dto/create-user.dto';
import { GetUserDTO } from './dto/get-user.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}

  async create(createUserDto: CreateUserDTO) {
    await this.validateCreateUser(createUserDto);
    return this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    });
  }
  async getUser(getUserDto: GetUserDTO) {
    return this.usersRepository.findOne(getUserDto);
  }

  async validateCreateUser(createUserDto: CreateUserDTO) {
    try {
      await this.usersRepository.findOne({
        email: createUserDto.email,
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        return;
      }
      throw err;
    }
    throw new UnprocessableEntityException('User already exists');
  }

  async verifyUser(email: string, password: string) {
    let user: UserDocument;
    try {
      user = await this.usersRepository.findOne({ email });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }
}
