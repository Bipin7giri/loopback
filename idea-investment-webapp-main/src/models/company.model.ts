import {belongsTo, model, property} from '@loopback/repository';
import {BaseEntity} from './base-entity.model';
import {Media} from './media.model';

@model({name: 'companies'})
export class Company extends BaseEntity {
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
    type: 'string',
  })
  information?: string;

  @belongsTo(() => Media, {keyFrom: 'coverImageId'}, {name: 'cover_image_id'})
  coverImageId: number;

  @belongsTo(() => Media, {keyFrom: 'logoId'}, {name: 'logo_id'})
  logoId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Company>) {
    super(data);
  }
}

export interface CompanyRelations {
  // describe navigational properties here
}

export type CompanyWithRelations = Company & CompanyRelations;
