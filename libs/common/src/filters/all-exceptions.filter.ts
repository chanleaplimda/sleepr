import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = this.getErrorCode(status);
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, any>;

        // Handle class-validator validation errors array
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          details = responseObj.message;
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
          code =
            responseObj.error && typeof responseObj.error === 'string'
              ? responseObj.error.toUpperCase().replace(/\s+/g, '_')
              : this.getErrorCode(status);
          details = responseObj.details ?? null;
        } else {
          message = exception.message || 'Request failed';
          code = this.getErrorCode(status);
          details = responseObj.details ?? null;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
      message = 'An unexpected error occurred. Please try again later.';
      code = 'INTERNAL_SERVER_ERROR';
    } else {
      this.logger.error('Unknown Exception thrown', exception);
      message = 'An unexpected error occurred. Please try again later.';
      code = 'INTERNAL_SERVER_ERROR';
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      error: {
        code,
        details,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return `HTTP_${status}`;
    }
  }
}

