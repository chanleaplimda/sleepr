import { IsEmail, IsOptional, IsString } from 'class-validator'

export class NotifyEmailDto {
  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  text?: string
}
