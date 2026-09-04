import { AllExceptionsFilter, ResponseInterceptor } from '@app/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { Logger } from 'nestjs-pino'
import { NotificationModule } from './notification.module'

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule)
  const configService = app.get(ConfigService)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.getOrThrow('PORT'),
    },
  })
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
  app.useGlobalFilters(new AllExceptionsFilter())
  await app.startAllMicroservices()
}
bootstrap()
