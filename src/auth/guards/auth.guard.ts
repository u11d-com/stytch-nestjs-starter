import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_MASTER_KEY_REQUIRED, IS_PUBLIC_KEY } from '../decorators';
import { AuthService, CachedSession } from '../auth.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly masterKey =
    process.env.MASTER_KEY || randomBytes(128).toString('hex');

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(
        `Public route: ${request.path}, no authentication required`,
      );
      return true;
    }

    const isMasterKeyRequired = this.reflector.getAllAndOverride<boolean>(
      IS_MASTER_KEY_REQUIRED,
      [context.getHandler(), context.getClass()],
    );

    if (isMasterKeyRequired) {
      return this.verifyMasterKey(request);
    }

    const session = await this.authorizeSession(request);
    request['user'] = session;

    this.logger.debug(`User ${session.userId} is authorized`);

    return true;
  }

  private verifyMasterKey(request: Request): boolean {
    const masterKey = request.headers['x-api-key'];

    if (masterKey === this.masterKey) {
      this.logger.debug(`Master API key provided for path: ${request.path}`);
      return true;
    } else {
      this.logger.debug(
        `Invalid master API key provided for path: ${request.path}`,
      );
      throw new ForbiddenException('Invalid master API key');
    }
  }

  private async authorizeSession(request: Request): Promise<CachedSession> {
    const sessionToken = request.headers['authorization']?.split(' ')[1];

    if (!sessionToken) {
      this.logger.debug(`No session token provided for path: ${request.path}`);
      throw new UnauthorizedException(
        'Session token is required for this route',
      );
    }

    const session = await this.authService.getSession(sessionToken);

    if (!session) {
      this.logger.debug(
        `Invalid session token provided for path: ${request.path}`,
      );
      throw new ForbiddenException('Invalid session');
    }

    return session;
  }
}
