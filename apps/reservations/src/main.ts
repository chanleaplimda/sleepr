import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { ReservationsModule } from './reservations.module'

async function bootstrap() {
  const app = await NestFactory.create(ReservationsModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  const configService = app.get(ConfigService)
  await app.listen(configService.getOrThrow<number>('PORT'))
}
void bootstrap()
