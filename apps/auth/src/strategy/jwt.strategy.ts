import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UsersService } from 'apps/auth/src/users/users.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { TokenPayload } from '../interface/token-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => req?.cookies?.Authentication || req?.Authentication,
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }
  async validate({ userId }: TokenPayload) {
    return this.usersService.getUser({ _id: userId })
  }
}
