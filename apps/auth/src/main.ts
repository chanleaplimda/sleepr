import { AllExceptionsFilter, ResponseInterceptor } from '@app/common'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import cookieParser from 'cookie-parser'
import { Logger } from 'nestjs-pino'
import { AuthModule } from './auth.module'

async function bootstrap() {
  const app = await NestFactory.create(AuthModule)
  const _configService = app.get(ConfigService)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: _configService.get('TCP_PORT'),
    },
  })
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useLogger(app.get(Logger))
  const configService = app.get(ConfigService)
  await app.startAllMicroservices()
  await app.listen(configService.getOrThrow<number>('HTTP_PORT'))
}
bootstrap()
