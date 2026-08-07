import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { UserDocument } from './users/models/user.schema'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: UserDocument, response: Response) {
    const tokenPayload = {
      userId: user._id,
    }
    const expires = new Date()
    expires.setSeconds(
      expires.getSeconds() +
        this.configService.getOrThrow<number>('JWT_EXPIRATION_TIME'),
    )
    const token = this.jwtService.sign(tokenPayload)
    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    })
  }
}
