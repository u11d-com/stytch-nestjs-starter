import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StytchModule } from 'src/stytch/stytch.module';
import { UserService } from './user.service';
import { User } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([User]), StytchModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
