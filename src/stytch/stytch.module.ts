import { Module } from '@nestjs/common';
import { StytchService } from './stych.service';

@Module({
  providers: [StytchService],
  exports: [StytchService],
})
export class StytchModule {}
