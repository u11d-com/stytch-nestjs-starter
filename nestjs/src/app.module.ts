import { Module } from '@nestjs/common';
import { ResourceModule } from './resource/resource.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, ResourceModule, UserModule],
})
export class AppModule {}
