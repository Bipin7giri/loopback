import {belongsTo, model, property} from '@loopback/repository';
import {CATEGORY_TYPE} from '../enums/';
import {BaseEntity} from './base-entity.model';

@model({ name: 'categories' })
export class Category extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'name',
      dataType: 'varchar'
    }
  })
  name: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'slug',
      dataType: 'varchar'
    }
  })
  slug: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(CATEGORY_TYPE),
    },
    name: 'type',
    postgresql: {
      columnName: 'type',
      dataType: 'varchar'
    }
  })
  type: CATEGORY_TYPE;

  @property({
    type: 'number',
    required: false,
    default: null
  })
  priority: number;

  @belongsTo(() => Category, { keyFrom: 'parentId' }, { name: 'parent_id' })
  parentId: number;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
