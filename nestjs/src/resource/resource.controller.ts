import { Controller, Get } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceModel } from './resource.model';

@Controller()
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  findAll(): ResourceModel[] {
    return this.resourceService.findAll();
  }
}
