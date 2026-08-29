import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BYPASS_RESPONSE_TRANSFORM_KEY,
  RESPONSE_MESSAGE_KEY,
} from '../decorators/response-message.decorator';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const bypass = this.reflector.getAllAndOverride<boolean>(
      BYPASS_RESPONSE_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (bypass) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request?.method?.toUpperCase();

    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => {
        // If data is already standardized, return as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data;
        }

        const message = customMessage || this.getDefaultMessage(method);

        // Standardize delete responses
        if (method === 'DELETE') {
          return {
            success: true,
            message,
            data: null as any,
          };
        }

        return {
          success: true,
          message,
          data: data ?? null,
        };
      }),
    );
  }

  private getDefaultMessage(method?: string): string {
    switch (method) {
      case 'POST':
        return 'Resource created successfully';
      case 'GET':
        return 'Resource retrieved successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      default:
        return 'Request successful';
    }
  }
}

