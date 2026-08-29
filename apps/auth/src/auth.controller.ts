import { CurrentUser, ResponseMessage } from '@app/common'
import { Controller, Post, Res, UseGuards } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guard/jwt-auth.guard'
import { LocalAuthGuard } from './guard/local-auth.guard'
import { UserDocument } from './users/models/user.schema'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successful')
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response)
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user
  }
}
