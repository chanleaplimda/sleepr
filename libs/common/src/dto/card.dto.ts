import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CardDTO {
  @IsString()
  @IsNotEmpty()
  cvc: string

  @IsNumber()
  exp_month: number

  @IsNumber()
  exp_year: number

  @IsString()
  @IsNotEmpty()
  number: string
}
