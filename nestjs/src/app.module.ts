import { Module } from '@nestjs/common';
import { ResourceModule } from './resource/resource.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, ResourceModule],
})
export class AppModule {}
