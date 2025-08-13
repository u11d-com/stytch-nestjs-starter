import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  Client,
  MagicLinksEmailLoginOrCreateResponse,
  StytchErrorJSON,
} from 'stytch';
import { CreateUserDto } from '../user/dto';

@Injectable()
export class StytchService {
  private readonly logger = new Logger(StytchService.name);
  private readonly client: Client;
  private readonly signUpRedirectionUrl =
    process.env.STYTCH_SIGN_UP_REDIRECTION_URL || undefined;
  private readonly projectId = process.env.STYTCH_PROJECT_ID;
  private readonly secret = process.env.STYTCH_SECRET;

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

  async create(
    dto: CreateUserDto,
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
