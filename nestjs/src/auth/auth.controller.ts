import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  CreatePasswordDto,
  InviteUserDto,
  LoginDto,
  LogoutDto,
  RefreshSessionDto,
  SignUpDto,
} from './dto';
import { AuthService } from './auth.service';
import { MasterKeyRequired, Public } from './decorators';
import { SessionTokenModel } from './model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() dto: SignUpDto): Promise<SessionTokenModel> {
    return this.authService.signUp(dto);
  }

  @Post('/invite')
  @MasterKeyRequired()
  create(@Body() dto: InviteUserDto) {
    return this.authService.inviteUser(dto);
  }

  @Post('/password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async createPassword(
    @Body() dto: CreatePasswordDto,
  ): Promise<SessionTokenModel> {
    return this.authService.createPassword(dto);
  }

  @Post('/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<SessionTokenModel> {
    return this.authService.login(dto);
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshSession(
    @Body() dto: RefreshSessionDto,
  ): Promise<SessionTokenModel> {
    return this.authService.refreshSession(dto);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(dto);
  }
}
