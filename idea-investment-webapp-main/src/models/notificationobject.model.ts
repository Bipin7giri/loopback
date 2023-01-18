import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Notification} from './notification.model';

@model()
export class Notificationobject extends Entity {
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
  key: string;

  @property({
    type: 'string',
  })
  value?: string;

  @belongsTo(() => Notification)
  notificationId: number;

  constructor(data?: Partial<Notificationobject>) {
    super(data);
  }
}

export interface NotificationobjectRelations {
  // describe navigational properties here
}

export type NotificationobjectWithRelations = Notificationobject & NotificationobjectRelations;
