import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Transporter } from 'nodemailer'
import * as nodemailer from 'nodemailer'
import { NotifyEmailDto } from './dto/notify-email.dto'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  private readonly transporter: Transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        clientId: this.configService.getOrThrow<string>(
          'GOOGLE_OAUTH_CLIENT_ID',
        ),
        clientSecret: this.configService.getOrThrow<string>(
          'GOOGLE_OAUTH_CLIENT_SECRET',
        ),
        refreshToken: this.configService.getOrThrow<string>(
          'GOOGLE_OAUTH_REFRESH_TOKEN',
        ),
      },
    })
  }

  async notifyEmail({ email, text }: NotifyEmailDto) {
    try {
      await this.transporter.sendMail({
        from: this.configService.getOrThrow<string>('SMTP_USER'),
        to: email,
        subject: 'Sleepr Notification',
        text:
          text ||
          'Your payment was successful and your reservation is confirmed.',
      })
      this.logger.log(`Email successfully sent to ${email}`)
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}`, err)
    }
  }
}
