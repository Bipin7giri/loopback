import {
  belongsTo,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import {CURRENCY_LABEL, CURRENCY_TYPE, PROJECT_TYPE} from '../enums';
import {BaseEntity} from './base-entity.model';
import {Company, Media, Order, ProjectImage, ProjectNews} from './index';
import {UserEnquiry} from './user-enquiry.model';
import {UserInvestment} from './user-investment.model';

@model({name: 'projects'})
export class Project extends BaseEntity {
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
  description?: string;
  @property({
    type: 'date',
    required: true,
    name: 'expired_date',
    postgresql: {
      columnName: 'expired_date',
      dataType: 'date',
    },
  })
  expiredDate: Date;
  @property({
    type: 'number',
    required: true,
    name: 'target_invest',
  })
  targetInvest: number;
  @property({
    type: 'number',
    required: true,
    name: 'highest_invest',
  })
  highestInvest: number;
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
    jsonSchema: {
      enum: Object.values(CURRENCY_LABEL),
    },
    postgresql: {
      columnName: 'currency_label',
      dataType: 'varchar',
    },
  })
  currencyLabel: CURRENCY_LABEL;
  @property({
    type: 'string',
    required: true,
    default: PROJECT_TYPE.long,
    jsonSchema: {
      enum: Object.values(PROJECT_TYPE),
    },
    postgresql: {
      columnName: 'investment_type',
      dataType: 'varchar',
    },
  })
  investmentType: PROJECT_TYPE;
  @property({
    type: 'string',
    name: 'profit_range',
  })
  profitRange?: string;

  @property({
    type: 'number',
    name: 'share_value',
    required: false,
    default: 0,
  })
  shareValue?: number;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'project_synopsis',
      dataType: 'varchar',
    },
  })
  project_synopsis?: string;
  @property({
    type: 'string',
    postgresql: {
      columnName: 'reason_to_invest',
      dataType: 'varchar',
    },
  })
  reason_to_invest?: string;
  @property({
    type: 'string',
    postgresql: {
      columnName: 'list',
      dataType: 'varchar',
    },
  })
  list?: string;
  @property({
    type: 'string',
  })
  idea?: string;
  @property({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive?: boolean;
  @hasMany(() => Order, {keyTo: 'projectId'})
  investments: Order[];
  @belongsTo(() => Company, {keyFrom: 'companyId'}, {name: 'company_id'})
  companyId: number;
  @hasOne(() => ProjectNews, {keyTo: 'projectId'})
  newsId: ProjectNews;
  @belongsTo(() => Media, {keyFrom: 'logoId'}, {name: 'logo_id'})
  logoId: number;
  @belongsTo(() => Media, {keyFrom: 'coverImageId'}, {name: 'cover_image_id'})
  coverImageId: number;
  // Define well-known properties here
  @hasMany(() => Media, {
    name: 'images',
    through: {
      model: () => ProjectImage,
      keyTo: 'mediaId',
      keyFrom: 'projectId',
    },
  })
  imageIds: Media[];

  @hasMany(() => UserEnquiry, {keyTo: 'projectId'})
  userEnquiries: UserEnquiry[];

  @hasMany(() => UserInvestment, {keyTo: 'projectId'})
  userInvestments: UserInvestment[];

  @property({
    type: 'number',
    default: 0,
  })
  totalInvestment: number; // FIXME: SET THE TOTALINVETMENT IN AUTH
  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
  constructor(data?: Partial<Project>) {
    super(data);
  }
}
export interface ProjectRelations {
  // describe navigational properties here
}
export type ProjectWithRelations = Project & ProjectRelations;
