import {belongsTo, model, property} from '@loopback/repository';
import {BaseEntity, Project} from '.';

@model({name: 'project_details'})
export class ProjectDetails extends BaseEntity {
  @property({
    id: true,
    generated: true,
    type: 'number',
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'content',
      dataType: 'text',
    },
  })
  content: string;

  @belongsTo(() => Project, {keyTo: 'projectId'}, {name: 'project_id'})
  projectId: number;

  constructor(data?: Partial<ProjectDetails>) {
    super(data);
  }
}

export interface ProjectDetailsRelations {
  //
}

export type ProjectDetailsWithRelations = ProjectDetails &
  ProjectDetailsRelations;
