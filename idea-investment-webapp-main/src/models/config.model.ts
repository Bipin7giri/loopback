import {model, property} from '@loopback/repository';
import {BaseEntity} from './base-entity.model';

@model({ name: 'configs' })
export class Config extends BaseEntity {
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
      columnName: 'key',
      dataType: 'varchar'
    }
  })
  key: string;

  @property({
    type: 'any',
    postgresql: {
      columnName: 'value',
      dataType: 'jsonb'
    }
  })
  value?: any;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Config>) {
    super(data);
  }
}

export interface ConfigRelations {
  // describe navigational properties here
}

export type ConfigWithRelations = Config & ConfigRelations;
