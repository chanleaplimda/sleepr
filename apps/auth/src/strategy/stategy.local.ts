import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { UsersService } from 'apps/auth/src/users/users.service'
import { Strategy } from 'passport-local'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string) {
    try {
      return await this.userService.validateUser(email, password)
    } catch (err) {
      throw new UnauthorizedException(err)
    }
  }
}
