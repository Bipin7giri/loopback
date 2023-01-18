import {belongsTo, model, property} from '@loopback/repository';
import {GROUP_TYPE} from '../enums/slider.enum';
import {BaseEntity} from './base-entity.model';
import {Media} from './media.model';

@model({name: 'sliders'})
export class Slider extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  slug: string;

  @property({
    type: 'string',
    default: GROUP_TYPE.PROMOTION,
    jsonSchema: {
      enum: Object.values(GROUP_TYPE),
    },
    postgresql: {
      columnName: 'group',
      dataType: 'varchar'
    }
  })
  group?: string;

  @property({
    type: 'Boolean',
    default: false,
    required: true,
    name: 'is_active',
  })
  isActive: Boolean;

  @property({
    type: 'Number',
  })
  priority: Number; // TODO: Set the Priority based on

  @belongsTo(() => Media, {keyFrom: 'imageId'}, {name: 'image_id'})
  imageId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Slider>) {
    super(data);
  }
}

export interface SliderRelations {
  // describe navigational properties here
}

export type SliderWithRelations = Slider & SliderRelations;
