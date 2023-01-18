import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Notificationobject,
  Notification,
} from '../models';
import {NotificationobjectRepository} from '../repositories';

export class NotificationobjectNotificationController {
  constructor(
    @repository(NotificationobjectRepository)
    public notificationobjectRepository: NotificationobjectRepository,
  ) { }

  @get('/notificationobjects/{id}/notification', {
    responses: {
      '200': {
        description: 'Notification belonging to Notificationobject',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Notification)},
          },
        },
      },
    },
  })
  async getNotification(
    @param.path.number('id') id: typeof Notificationobject.prototype.id,
  ): Promise<Notification> {
    return this.notificationobjectRepository.notification(id);
  }
}
