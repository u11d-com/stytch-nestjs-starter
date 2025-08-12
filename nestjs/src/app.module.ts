import { Module } from '@nestjs/common';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [ResourceModule],
})
export class AppModule {}
