import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {STATUS_TYPE} from '../enums/investment-status.enum';
import {BaseEntity} from './base-entity.model';
import {Project} from './project.model';
import {Transaction} from './transaction.model';
import {User} from './user.model';

@model({name: 'user_investments'})
export class UserInvestment extends BaseEntity {

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    default: STATUS_TYPE.PENDING,
    jsonSchema: {
      enum: Object.values(STATUS_TYPE),
    },
  })
  status?: string;

  @belongsTo(
    () => User,
    {keyFrom: 'userId'},
    {name: 'user_id'},
  )
  userId: number;

  @belongsTo(
    () => Project,
    {keyFrom: 'projectId'},
    {name: 'project_id'},
  )
  projectId?: number;

  @hasMany(() => Transaction, {keyTo: 'userInvestmentId'})
  transactions: Transaction[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserInvestment>) {
    super(data);
  }
}

export interface UserInvestmentRelations {
  // describe navigational properties here
}

export type UserInvestmentWithRelations = UserInvestment & UserInvestmentRelations;
