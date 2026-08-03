import { ValidationPipe } from '@nestjs/common'
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
  await app.listen(process.env.port ?? 3000)
}
void bootstrap()
