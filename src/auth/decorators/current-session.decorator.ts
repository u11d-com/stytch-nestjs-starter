import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CachedSession } from '../auth.service';

type RequestWithUser = {
  user: CachedSession | undefined;
};

/**
 * Decorator to get the current session user
 */
export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CachedSession | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    if (request.user) {
      return request.user;
    }
  },
);
