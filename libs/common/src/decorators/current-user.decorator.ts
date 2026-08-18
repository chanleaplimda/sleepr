import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'apps/auth/src/users/models/user.schema';

function getCurrentUserByContext(context: ExecutionContext): UserDocument {
  if (context.getType() === 'rpc') {
    return context.switchToRpc().getData().user;
  }
  return context.switchToHttp().getRequest().user;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
