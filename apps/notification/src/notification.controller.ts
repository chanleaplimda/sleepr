import { ResponseMessage } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { NotificationService } from './notification.service'

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ResponseMessage('Notification service is active')
  getHello(): string {
    return this.notificationService.getHello()
  }
}
