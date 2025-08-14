import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { StytchModule } from 'src/stytch/stytch.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards';
import { SessionRefreshInterceptor } from './interceptors';

@Module({
  imports: [StytchModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: SessionRefreshInterceptor },
  ],
})
export class AuthModule {}
