import {model, property} from '@loopback/repository';
import {Permissions} from "loopback4-authorization";
import {BaseEntity} from './base-entity.model';

@model({ name: 'roles' })
export class Role extends BaseEntity implements Permissions<String>{

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'name',
      dataType: 'varchar',
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'slug',
      dataType: 'varchar',
    },
  })
  slug: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions: string[];

  @property({
    type: 'number',
    required: true,
    default: 0
  })
  level: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;
