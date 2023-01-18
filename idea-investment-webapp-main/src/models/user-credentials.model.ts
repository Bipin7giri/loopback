import { belongsTo, model, property } from '@loopback/repository';
import { BaseEntity } from './base-entity.model';
import { User } from './user.model';

@model({name: 'user_credentials'})
export class UserCredentials extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;

  constructor(data?: Partial<UserCredentials>) {
    super(data);
  }
}

export interface UserCredentialsRelations {
    // describe navigational properties here
}

export type UserCredentialsWithRelations = UserCredentials &
    UserCredentialsRelations;
