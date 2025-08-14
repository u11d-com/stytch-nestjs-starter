import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  Client,
  MagicLinksEmailLoginOrCreateResponse,
  PasswordsCreateResponse,
  PasswordsEmailResetResponse,
  SessionsAuthenticateResponse,
  SessionsRevokeResponse,
  StytchErrorJSON,
} from 'stytch';
import {
  CreatePasswordDto,
  InviteUserDto,
  LoginDto,
  SignUpDto,
} from 'src/auth/dto';

@Injectable()
export class StytchService {
  private readonly logger = new Logger(StytchService.name);
  private readonly client: Client;
  private readonly signUpRedirectionUrl =
    process.env.STYTCH_SIGN_UP_REDIRECTION_URL || undefined;
  private readonly projectId = process.env.STYTCH_PROJECT_ID;
  private readonly secret = process.env.STYTCH_SECRET;
  public readonly sessionDurationMinutes = parseInt(
    process.env.STYTCH_SESSION_DURATION_MINUTES || '60',
    10,
  );

  constructor() {
    if (!(this.projectId && this.secret)) {
      throw new InternalServerErrorException(
        'Stytch confituration error. Check if all needed environment variables are set correctly.',
      );
    }

    this.client = new Client({
      project_id: this.projectId,
      secret: this.secret,
    });
  }

  async signUp(dto: SignUpDto): Promise<PasswordsCreateResponse> {
    try {
      const response = await this.client.passwords.create({
        email: dto.email,
        password: dto.password,
        session_duration_minutes: this.sessionDurationMinutes,
      });

      this.logger.debug(
        `User ${dto.email} with password created in Stytch: ${response.user_id}`,
      );

      return response;
    } catch (error) {
      this.logger.error('Error creating user with password in Stytch', error);
      throw error;
    }
  }

  async inviteUser(
    dto: InviteUserDto,
  ): Promise<MagicLinksEmailLoginOrCreateResponse> {
    try {
      const response = await this.client.magicLinks.email.loginOrCreate({
        email: dto.email,
        signup_magic_link_url: this.signUpRedirectionUrl,
      });

      this.logger.debug(
        `User ${dto.email} created in Stytch: ${response.user_id}`,
      );

      return response;
    } catch (error) {
      this.logger.error('Error creating user in Stytch', error);
      throw error;
    }
  }

  async setPassword(
    dto: CreatePasswordDto,
  ): Promise<PasswordsEmailResetResponse> {
    try {
      const response = await this.client.passwords.email.reset({
        token: dto.sessionToken,
        password: dto.password,
        session_duration_minutes: this.sessionDurationMinutes,
      });

      this.logger.debug(`Password set for user ${response.user_id} in Stytch`);

      return response;
    } catch (error) {
      this.logger.error('Error setting password in Stytch', error);

      if (this.isStytchError(error)) {
        if (error.error_type === 'unable_to_auth_magic_link') {
          throw new BadRequestException('Unable to authenticate magic link');
        }
      }

      throw error;
    }
  }

  async authenticate(dto: LoginDto) {
    try {
      const response = await this.client.passwords.authenticate({
        email: dto.email,
        password: dto.password,
        session_duration_minutes: this.sessionDurationMinutes,
      });

      this.logger.debug(`Successful user ${response.user_id} authentication`);

      return response;
    } catch (error) {
      if (this.isStytchError(error)) {
        if (
          ['email_not_found', 'unauthorized_credentials'].includes(
            error.error_type,
          )
        ) {
          throw new ForbiddenException();
        }

        if (error.error_type === 'no_user_password') {
          throw new BadRequestException('User does not have password');
        }
      }

      this.logger.error(`Error authenticating user ${dto.email}`, error);
      throw error;
    }
  }

  async refreshSession(
    session_token: string,
  ): Promise<SessionsAuthenticateResponse> {
    try {
      const response = await this.client.sessions.authenticate({
        session_token,
        session_duration_minutes: this.sessionDurationMinutes,
      });

      this.logger.debug(`Stytch session extended`);

      return response;
    } catch (error) {
      this.logger.error('Error extending Stytch session', error);
      throw error;
    }
  }

  async logout(session_token: string): Promise<SessionsRevokeResponse> {
    try {
      const response = await this.client.sessions.revoke({
        session_token,
      });

      this.logger.debug(`Session revoked`);

      return response;
    } catch (error) {
      this.logger.error(`Error revoking session token`, error);
      throw error;
    }
  }

  private isStytchError(error: unknown): error is StytchErrorJSON {
    return Boolean(
      error &&
        typeof error === 'object' &&
        'status_code' in error &&
        'request_id' in error &&
        'error_type' in error &&
        'error_message' in error &&
        'error_url' in error,
    );
  }
}
