import { Controller, Post, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { LocalAuthGuard } from './guard/local-auth.guard'
import { UserDocument } from './users/models/user.schema'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response)
  }
}
