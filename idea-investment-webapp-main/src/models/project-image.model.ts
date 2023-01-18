import {model, property} from '@loopback/repository';
import {BaseEntity} from './base-entity.model';

@model({name: 'project_images'})
export class ProjectImage extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'number',
    name: 'project_id',
  })
  projectId: number;

  @property({
    type: 'number',
    name: 'media_id',
  })
  mediaId: number;

  constructor(data?: Partial<ProjectImage>) {
    super(data);
  }
}

export interface ProjectImageRelations {
  // describe navigational properties here
}

export type ProjectImageWithRelations = ProjectImage & ProjectImageRelations;
