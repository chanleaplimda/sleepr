import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { Logger } from 'nestjs-pino'
import { PaymentModule } from './payment.module'

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule)
  const configService = app.get(ConfigService)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.getOrThrow('PORT'),
    },
  })
  app.useLogger(app.get(Logger))
  await app.startAllMicroservices()
}
bootstrap()
