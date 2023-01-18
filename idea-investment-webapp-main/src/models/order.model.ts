import {belongsTo, hasOne, model, property} from '@loopback/repository';
import {CURRENCY_TYPE, ORDERSTATUS} from '../enums';
import {BaseEntity} from './base-entity.model';
import {Project} from './project.model';
import {Transaction} from './transaction.model';
import {User} from './user.model';

@model({name: 'orders'})
export class Order extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(ORDERSTATUS),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'varchar',
    },
    default: ORDERSTATUS.requested,
  })
  status: ORDERSTATUS;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(CURRENCY_TYPE),
    },
    postgresql: {
      columnName: 'currency',
      dataType: 'varchar',
    },
  })
  currency: CURRENCY_TYPE;

  @property({
    type: 'string',
    required: true,
  })
  referenceId: string;

  @belongsTo(() => User, {keyFrom: 'orderById'}, {name: 'order_by_id'})
  orderById: number;

  @belongsTo(() => Project, {keyFrom: 'projectId'}, {name: 'project_id'})
  projectId: number;

  @hasOne(() => Transaction, {keyTo: 'orderId'})
  transaction: Transaction;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
