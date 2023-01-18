import {belongsTo, model, property} from '@loopback/repository';
import {BaseEntity} from './base-entity.model';
import {Project} from './project.model';
import {User} from './user.model';

@model({name: 'user_enquiries'})
export class UserEnquiry extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  subject: string;

  @property({
    type: 'string',
    required: true,
  })
  message: string;

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;

  @belongsTo(() => Project, {keyFrom: 'projectId'}, {name: 'project_id'})
  projectId: number;


  constructor(data?: Partial<UserEnquiry>) {
    super(data);
  }
}

export interface UserEnquiryRelations {
  // describe navigational properties here
}

export type UserEnquiryWithRelations = UserEnquiry & UserEnquiryRelations;
