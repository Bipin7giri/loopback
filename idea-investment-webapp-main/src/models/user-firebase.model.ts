import {belongsTo, model, property} from '@loopback/repository';
import {BaseEntity} from './base-entity.model';
import {User} from './user.model';

@model({name: 'user_firebase'})
export class UserFirebase extends BaseEntity {
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
      columnName: 'token',
      dataType: 'varchar',
    },
  })
  token: string;

  @property({
    type: 'string',
    // required: true,
    postgresql: {
      columnName: 'device',
      dataType: 'varchar',
    },
  })
  device: string;

  @belongsTo(() => User)
  userId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserFirebase>) {
    super(data);
  }
}

export interface UserFirebaseRelations {
  // describe navigational properties here
}

export type UserFirebaseWithRelations = UserFirebase & UserFirebaseRelations;
