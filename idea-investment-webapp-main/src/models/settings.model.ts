import {Entity, model, property} from '@loopback/repository';

@model({name: 'settings'})
export class Settings extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'date',
    required: true,
    default: () => new Date()
  })
  created_on: string;

  @property({
    type: 'date',
    required: true,
    default: () => new Date()
  })
  modified_on: string;

  @property({
    type: 'boolean',
    default: false
  })
  deleted?: boolean;

  @property({
    type: 'date',
  })
  deleted_on: string;


  @property({
    type: 'string',
  })
  deleted_by?: string;

  @property({
    type: 'string',
    required: true,
  })
  setting_group: string;

  @property({
    type: 'string',
    required: true,
  })
  key: string;

  @property({
    type: 'string',
    required: true,
  })
  value: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Settings>) {
    super(data);
  }
}

export interface SettingsRelations {
  // describe navigational properties here
}

export type SettingsWithRelations = Settings & SettingsRelations;
