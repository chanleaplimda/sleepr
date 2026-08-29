import { AllExceptionsFilter, ResponseInterceptor } from '@app/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { NotificationModule } from './notification.module'

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule)
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
  app.useGlobalFilters(new AllExceptionsFilter())
  await app.listen(process.env.port ?? 3000)
}
bootstrap()
