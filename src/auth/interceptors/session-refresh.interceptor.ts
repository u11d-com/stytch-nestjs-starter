import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { AuthService, CachedSession } from '../auth.service';
import { IS_PUBLIC_KEY, IS_MASTER_KEY_REQUIRED } from '../decorators';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

type RequestWithUser = Request & {
  user?: CachedSession;
};

@Injectable()
export class SessionRefreshInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SessionRefreshInterceptor.name);
  private readonly sessionRefreshThresholdMinutes = parseInt(
    process.env.STYTCH_SESSION_REFRESH_THRESHOLD_MINUTES || '30',
    10,
  );

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isMasterKeyRequired = this.reflector.getAllAndOverride<boolean>(
      IS_MASTER_KEY_REQUIRED,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic || isMasterKeyRequired) {
      return next.handle();
    }

    await this.checkAndRefreshSession(request, response);

    return next.handle();
  }

  private async checkAndRefreshSession(
    request: RequestWithUser,
    response: Response,
  ): Promise<void> {
    const sessionToken = request.headers['authorization']?.split(' ')[1];

    if (!sessionToken || !request.user) {
      return;
    }

    try {
      const hashedSessionToken =
        this.authService.hashSessionToken(sessionToken);
      const sessionTtl = await this.cacheManager.ttl(hashedSessionToken);

      if (!sessionTtl) {
        return this.logger.debug('Session token not found in cache');
      }

      const expirationTime = new Date(sessionTtl);

      const shouldRefresh =
        expirationTime.getTime() - new Date().getTime() <=
        this.sessionRefreshThresholdMinutes * 60 * 1000;

      if (shouldRefresh) {
        this.logger.debug(
          `Session expires within threshold (${this.sessionRefreshThresholdMinutes} minutes), refreshing...`,
        );

        const refreshResult = await this.authService.refreshSession({
          sessionToken,
        });

        response.setHeader('X-New-Session-Token', refreshResult.sessionToken);
        this.logger.debug(
          'Session refreshed successfully and new token set in header',
        );
      }
    } catch (error) {
      this.logger.warn('Failed to check or refresh session', error);
    }
  }
}
