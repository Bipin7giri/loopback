import { belongsTo, model, property } from '@loopback/repository';
import { BaseEntity } from './base-entity.model';
import { Role } from './role.model';
import { User } from './user.model';

@model({name: 'user_roles'})
export class UserRoles extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @belongsTo(() => Role, {keyFrom: 'roleId'}, {name: 'role_id'})
  roleId: number;

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserRoles>) {
    super(data);
  }
}

export interface UserRolesRelations {
  // describe navigational properties here
}

export type UserRolesWithRelations = UserRoles & UserRolesRelations;
