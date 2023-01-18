import {belongsTo, model, property} from '@loopback/repository';
import {MIMETYPE} from "../enums";
import {BaseEntity} from './base-entity.model';
import {User} from './user.model';

@model({name: 'medias'})
export class Media extends BaseEntity {
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
      columnName: 'filename',
      dataType: 'varchar'
    }
  })
  filename: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'path',
      dataType: 'varchar'
    }
  })
  path: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(MIMETYPE),
    },
    postgresql: {
      columnName: 'mimetype',
      dataType: 'varchar'
    }
  })
  mimetype: MIMETYPE;

  @property({
    type: 'number',
    required: true,
  })
  size: number;

  @belongsTo(() => User)
  userId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Media>) {
    super(data);
  }
}

export interface MediaRelations {
  // describe navigational properties here
}

export type MediaWithRelations = Media & MediaRelations;
