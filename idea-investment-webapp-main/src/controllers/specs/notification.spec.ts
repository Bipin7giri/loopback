import {SchemaObject} from '@loopback/rest';

import {
  DEVICE,
  NOTIFICATIONTYPE,
  NOTIFICATION_STATUS,
} from '../../enums/notification.enum';

const templateSchema = (require: string[]): SchemaObject => {
  return {
    type: 'object',
    required: ['title', 'device', 'status', 'body', 'key', 'value'],
    properties: {
      title: {
        type: 'string',
      },
      notifierId: {
        type: 'number',
      },
      image: {
        type: 'string',
      },
      key: {
        type: 'string',
        enum: [
          NOTIFICATIONTYPE.Orderid,
          NOTIFICATIONTYPE.Coupon,
          NOTIFICATIONTYPE.Offer,
          NOTIFICATIONTYPE.Link,
          NOTIFICATIONTYPE.URL,
          NOTIFICATIONTYPE.Project,
          NOTIFICATIONTYPE.ScreenName,
        ],
      },
      value: {
        type: 'string',
      },
      device: {
        type: 'string',
        enum: [DEVICE.all, DEVICE.android, DEVICE.ios],
      },
      status: {
        type: 'string',
        enum: [NOTIFICATION_STATUS.publish, NOTIFICATION_STATUS.save],
      },
      body: {
        type: 'string',
      },
    },
  };
};
const notificationSchema: SchemaObject = templateSchema([
  'title',
  'notifierId',
  'template',
  'image',
  'device',
  'key',
  'value',
]);

const notificationAndTemplate: SchemaObject = templateSchema([]);
export const NotificationTemplate = {
  description: 'The input of create project detail function',
  required: true,
  content: {
    'application/json': {
      schema: notificationAndTemplate,
    },
  },
};
export const NotificationTemplatePostRequest = {
  description: 'The input of create project detail function',
  required: true,
  content: {
    'application/json': {
      schema: notificationSchema,
    },
  },
};
