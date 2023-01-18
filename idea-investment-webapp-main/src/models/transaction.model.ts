import {belongsTo, model, property} from '@loopback/repository';
import {CURRENCY_TYPE, PAYMENTMETHOD} from '../enums/';
import {BaseEntity} from './base-entity.model';
import {Order} from './order.model';
import {UserInvestment} from './user-investment.model';
import {User} from './user.model';

@model({name: 'transactions'})
export class Transaction extends BaseEntity {
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
      enum: Object.values(CURRENCY_TYPE),
    },
    postgresql: {
      columnName: 'currency',
      dataType: 'varchar',
    },
  })
  currency: CURRENCY_TYPE;

  @property({
    type: 'number',
    required: true,
    name: 'requested_amount',
  })
  requestedAmount: number;

  @property({
    type: 'number',
    name: 'paid_amount',
  })
  paidAmount: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(PAYMENTMETHOD),
    },
    name: 'payment_method',
    postgresql: {
      columnName: 'payment_method',
      dataType: 'varchar',
    },
  })
  paymentMethod: PAYMENTMETHOD;

  @property({
    type: 'any',
    name: 'payment_response',
    postgresql: {
      columnName: 'payment_response',
      dataType: 'jsonb',
    },
  })
  paymentResponse?: any;

  @property({
    type: 'string',
    required: true,
    name: 'reference_id',
    postgresql: {
      columnName: 'reference_id',
      dataType: 'varchar',
    },
  })
  referenceId: string;

  @property({
    type: 'string',
    required: false,
    name: 'transaction_id',
    postgresql: {
      columnName: 'transaction_id',
      dataType: 'varchar',
    },
  })
  transactionId: string;

  @property({
    type: 'date',
    required: false,
    name: 'payment_date',
    jsonSchema: {
      format: 'date',
    },
  })
  paymentDate?: Date;

  @belongsTo(
    () => User,
    {keyFrom: 'transactionById'},
    {name: 'transaction_by_id'},
  )
  transactionById: number;

  @belongsTo(() => Order, {keyFrom: 'orderId'}, {name: 'order_id'})
  orderId: number;

  @belongsTo(
    () => UserInvestment,
    {keyFrom: 'userInvestmentId'},
    {name: 'user_investment_id'},
  )
  userInvestmentId?: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Transaction>) {
    super(data);
  }
}

export interface TransactionRelations {
  // describe navigational properties here
}

export type TransactionWithRelations = Transaction & TransactionRelations;
