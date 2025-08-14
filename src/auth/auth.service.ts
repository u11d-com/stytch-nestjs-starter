import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import {
  CreatePasswordDto,
  InviteUserDto,
  LoginDto,
  LogoutDto,
  RefreshSessionDto,
  SignUpDto,
} from './dto';
import { StytchService } from '../stytch/stych.service';
import { SessionTokenModel } from './model';
import { User } from 'src/user/entities';
import { Session } from 'stytch';

export type CachedSession = {
  userId: string;
  stytchUserId: string | undefined;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly stytchService: StytchService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async storeSession(
    sessionToken: string,
    {
      session_id: sessionId,
      user_id: stytchUserId,
      expires_at: expiresAt,
    }: Session,
  ): Promise<SessionTokenModel> {
    if (!(sessionId && sessionToken && stytchUserId)) {
      this.logger.debug(
        `Session data is incomplete: sessionId=${sessionId}, sessionToken=${sessionToken}, stytchUserId=${stytchUserId}`,
      );
      throw new NotFoundException('Session not found');
    }

    const user = await this.userService.fetchByStytchId(stytchUserId);

    if (!user) {
      this.logger.debug(`User with Stytch ID ${stytchUserId} does not exist`);
      throw new NotFoundException('User does not exist');
    }

    const value: CachedSession = {
      userId: user.id,
      stytchUserId,
    };

    const ttl = expiresAt
      ? new Date(expiresAt).getTime() - new Date().getTime()
      : this.stytchService.sessionDurationMinutes * 60 * 1000;
    await this.cacheManager.set(sessionToken, value, ttl);

    return {
      sessionToken,
    };
  }

  async signUp(dto: SignUpDto): Promise<SessionTokenModel> {
    const {
      session,
      session_token: sessionToken,
      user_id: stytchUserId,
    } = await this.stytchService.signUp(dto);

    if (!session) {
      this.logger.debug('Session not found after sign up');
      throw new InternalServerErrorException('Session not found');
    }

    await this.userService.create({
      ...dto,
      stytchUserId,
    });

    await this.storeSession(sessionToken, session);

    return { sessionToken };
  }

  async inviteUser(dto: InviteUserDto): Promise<User> {
    const existingUser = await this.userService.fetchByEmail(dto.email);

    if (existingUser) {
      this.logger.debug(
        `User with email ${dto.email} already exists, skipping invitation`,
      );
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const { user_id: stytchUserId } = await this.stytchService.inviteUser(dto);

    if (!stytchUserId) {
      this.logger.debug(
        `Failed to create Stytch user ${dto.email} (${stytchUserId}) during invitation`,
      );
      throw new InternalServerErrorException('Failed to create Stytch user');
    }

    const user = await this.userService.create({
      ...dto,
      stytchUserId,
    });

    return user;
  }

  async createPassword(dto: CreatePasswordDto): Promise<SessionTokenModel> {
    const { session_token: sessionToken } =
      await this.stytchService.setPassword(dto);

    return { sessionToken };
  }

  async login(dto: LoginDto): Promise<SessionTokenModel> {
    const { session, session_token: sessionToken } =
      await this.stytchService.authenticate(dto);

    if (!session) {
      this.logger.debug('Session not found after login');
      throw new InternalServerErrorException('Session not found');
    }

    return this.storeSession(sessionToken, session);
  }

  async refreshSession(dto: RefreshSessionDto): Promise<SessionTokenModel> {
    const { session_token: sessionToken, session } =
      await this.stytchService.refreshSession(dto.sessionToken);

    if (session.session_id !== dto.sessionToken) {
      await this.cacheManager.del(dto.sessionToken);
    }

    const sessionResult = await this.storeSession(sessionToken, session);

    return sessionResult;
  }

  async logout({ sessionToken }: LogoutDto): Promise<void> {
    await Promise.all([
      this.stytchService.logout(sessionToken),
      this.cacheManager.del(sessionToken),
    ]);
  }

  async getSession(sessionToken: string): Promise<CachedSession | undefined> {
    return this.cacheManager.get<CachedSession>(sessionToken);
  }
}
