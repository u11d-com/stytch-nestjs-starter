import { Injectable } from '@nestjs/common';
import { ResourceModel } from './resource.model';

const RESOURCES: ResourceModel[] = [
  { id: 1, name: 'Resource One' },
  { id: 2, name: 'Resource Two' },
];

@Injectable()
export class ResourceService {
  findAll(): ResourceModel[] {
    return RESOURCES;
  }
}
