import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StytchModule } from 'src/stytch/stytch.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards';

@Module({
  imports: [StytchModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
