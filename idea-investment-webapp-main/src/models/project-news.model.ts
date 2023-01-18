import {belongsTo, hasOne, model, property} from '@loopback/repository';
import {BaseEntity, Media, Project, User} from '.';

@model({name: 'project_news'})
export class ProjectNews extends BaseEntity {
  @property({
    id: true,
    generated: true,
    type: 'number',
  })
  id: number;

  @property({
    type: 'string',
    required: false,
  })
  title: string;

  @property({
    type: 'string',
    required: false,
  })
  content: string;

  @property({
    type: 'string',
    required: false,
  })
  slug: string;

  @hasOne(() => Media)
  coverImages: number;

  @belongsTo(() => User, {keyTo: 'userId'})
  authorId: number;

  @belongsTo(() => Project, {keyTo: 'projectId'})
  projectId: number;

  constructor(data?: Partial<ProjectNews>) {
    super(data);
  }
}

export interface ProjectNewsRelations {}

export type ProjectNewsWithRelations = ProjectNews & ProjectNewsRelations;
