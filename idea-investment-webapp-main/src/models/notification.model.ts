import {hasMany, model, property} from '@loopback/repository';
import {DEVICE, NOTIFICATION_STATUS} from '../enums';
import {BaseEntity} from './base-entity.model';
import {Notificationobject} from './notificationobject.model';

@model()
export class Notification extends BaseEntity {
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
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  body: string;

  @property({
    type: 'string',
  })
  image?: string;

  @property({
    type: 'string',
  })
  notifierId?: string;

  @property({
    type: 'string',
    // required: true,
    default: () => DEVICE.all,
    jsonSchema: {
      enum: Object.values(DEVICE),
    },
    postgresql: {
      columnName: 'device',
      dataType: 'varchar',
    },
  })
  device: DEVICE;

  @property({
    type: 'string',
    // required: true,
    default: () => NOTIFICATION_STATUS.save,
    jsonSchema: {
      enum: Object.values(NOTIFICATION_STATUS),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'varchar',
    },
  })
  status: NOTIFICATION_STATUS;

  @hasMany(() => Notificationobject)
  notificationobjects: Notificationobject[];

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  // describe navigational properties here
}

export type NotificationWithRelations = Notification & NotificationRelations;
