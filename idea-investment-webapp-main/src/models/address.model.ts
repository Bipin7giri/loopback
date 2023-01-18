import {belongsTo, model, property} from '@loopback/repository';
import {BaseEntity} from './base-entity.model';
import {User} from './user.model';

@model({ name: 'addresses' })
export class Address extends BaseEntity {
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
      columnName: 'country',
      dataType: 'varchar',
    },
  })
  country: string;

  @property({
    type: 'string',
  })
  postcode?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'address',
      dataType: 'varchar',
    },
  })
  address: string;

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

export interface AddressRelations {
  // describe navigational properties here
}

export type AddressWithRelations = Address & AddressRelations;
