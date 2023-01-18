import {
  belongsTo,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import {IAuthUser} from 'loopback4-authentication';
import {GENDER, TOKEN_TYPE} from '../enums';
import {Address} from './address.model';
import {Article} from './article.model';
import {BaseEntity} from './base-entity.model';
import {Media} from './media.model';
import {Order} from './order.model';
import {Role} from './role.model';
import {UserCredentials} from './user-credentials.model';
import {UserEnquiry} from './user-enquiry.model';
import {UserInvestment} from './user-investment.model';
import {UserRoles} from './user-roles.model';

@model({name: 'users'})
export class User extends BaseEntity implements IAuthUser {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    name: 'full_name',
    postgresql: {
      columnName: 'full_name',
      dataType: 'varchar',
    },
  })
  fullName?: string;

  @property({
    type: 'string',
    // required: true,
    index: {
      unique: true,
    },
    postgresql: {
      columnName: 'email',
      dataType: 'varchar',
    },
  })
  email: string;

  @property({
    type: 'boolean',
    // required: true,
    default: false,
    name: 'is_email_verified',
  })
  isEmailVerified: boolean;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'phone',
      dataType: 'varchar',
    },
  })
  phone?: string;

  @property({
    type: 'boolean',
    // required: true,
    default: false,
    name: 'is_phone_verified',
  })
  isPhoneVerified: boolean;

  @property({
    type: 'string',
    default: false,
    jsonSchema: {
      enum: [GENDER.male, GENDER.female, GENDER.other],
    },
    postgresql: {
      columnName: 'gender',
      dataType: 'varchar',
    },
  })
  gender: boolean;

  @property({
    type: 'date',
    // required: false,
    name: 'dob',
    postgresql: {
      columnName: 'dob',
      dataType: 'date',
    },
  })
  DOB: Date;

  @property({
    type: 'number',
    default: null,
  })
  token?: number | null;

  @property({
    type: 'date',
    name: 'token_expired_date',
    default: null,
  })
  tokenExpiredDate?: Date | null;

  @property({
    type: 'string',
    name: 'token_type',
    default: null,
    jsonSchema: {
      enum: [TOKEN_TYPE.resetPassword, TOKEN_TYPE.verification],
    },
    postgresql: {
      columnName: 'token_type',
      dataType: 'varchar',
    },
  })
  tokenType?: TOKEN_TYPE | null;

  @property({
    type: 'string',
    name: 'google_id',
    default: null,
    postgresql: {
      columnName: 'google_id',
      dataType: 'varchar',
    },
  })
  googleId?: string;

  @property({
    type: 'string',
    name: 'apple_id',
    default: null,
    postgresql: {
      columnName: 'apple_id',
      dataType: 'varchar',
    },
  })
  appleId?: string;

  @property({
    type: 'string',
    name: 'refresh_token',
    default: null,
    postgresql: {
      columnName: 'refresh_token',
      dataType: 'varchar',
    },
  })
  refreshToken?: string;
  @property({
    type: 'string',
    name: 'access_token',
    default: null,
    postgresql: {
      columnName: 'access_token',
      dataType: 'varchar',
    },
  })
  accessToken?: string;

  @property({
    type: 'string',
    name: 'reset_key',
  })
  resetKey?: string;

  @property({
    type: 'string',
    name: 'userfirebase_id',
  })
  userFireBaseId?: string;

  @property({
    type: 'date',
    name: 'last_login',
    default: null,
    postgresql: {
      columnName: 'last_login',
      dateType: 'TIMESTAMP',
    },
  })
  lastLogin?: Date;

  @hasMany(() => Role, {
    through: {model: () => UserRoles, keyFrom: 'userId', keyTo: 'roleId'},
  })
  roles: Role[];

  @hasOne(() => UserCredentials, {keyTo: 'userId'})
  userCredentials: UserCredentials;

  @hasOne(() => Address, {keyTo: 'userId'})
  address: Address;

  @hasMany(() => Article, {keyTo: 'userId'})
  articles: Article[];

  @belongsTo(
    () => Media,
    {keyFrom: 'profilePictureId'},
    {name: 'profile_picture_id'},
  )
  profilePictureId: number;

  @hasMany(() => UserEnquiry, {keyTo: 'userId'})
  userEnquiries: UserEnquiry[];
  username: string;

  @property({
    type: 'boolean',
    nullable: true,
  })
  isLogin: boolean;

  @property({
    type: 'boolean',
    nullable: true,
    default: true,
  })
  status: boolean;

  @hasMany(() => UserInvestment, {keyTo: 'userId'})
  userInvestments: UserInvestment[];

  @hasMany(() => Order, {keyTo: 'orderById'})
  order: Order[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
