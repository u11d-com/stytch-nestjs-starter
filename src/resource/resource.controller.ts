import { Controller, Get, Logger } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceModel } from './resource.model';
import { CurrentSession } from 'src/auth/decorators';
import { CachedSession } from 'src/auth/auth.service';

@Controller('resources')
export class ResourceController {
  private readonly logger = new Logger(ResourceController.name);

  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  findAll(@CurrentSession() session: CachedSession): ResourceModel[] {
    this.logger.debug(`User ${session.userId} requested all resources`);
    return this.resourceService.findAll();
  }
}
