import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Notification,
  Notificationobject,
} from '../models';
import {NotificationRepository} from '../repositories';

export class NotificationNotificationobjectController {
  constructor(
    @repository(NotificationRepository) protected notificationRepository: NotificationRepository,
  ) { }

  @get('/notifications/{id}/notificationobjects', {
    responses: {
      '200': {
        description: 'Array of Notification has many Notificationobject',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Notificationobject)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Notificationobject>,
  ): Promise<Notificationobject[]> {
    return this.notificationRepository.notificationobjects(id).find(filter);
  }

  @post('/notifications/{id}/notificationobjects', {
    responses: {
      '200': {
        description: 'Notification model instance',
        content: {'application/json': {schema: getModelSchemaRef(Notificationobject)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Notification.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notificationobject, {
            title: 'NewNotificationobjectInNotification',
            exclude: ['id'],
            optional: ['notificationId']
          }),
        },
      },
    }) notificationobject: Omit<Notificationobject, 'id'>,
  ): Promise<Notificationobject> {
    return this.notificationRepository.notificationobjects(id).create(notificationobject);
  }

  @patch('/notifications/{id}/notificationobjects', {
    responses: {
      '200': {
        description: 'Notification.Notificationobject PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notificationobject, {partial: true}),
        },
      },
    })
    notificationobject: Partial<Notificationobject>,
    @param.query.object('where', getWhereSchemaFor(Notificationobject)) where?: Where<Notificationobject>,
  ): Promise<Count> {
    return this.notificationRepository.notificationobjects(id).patch(notificationobject, where);
  }

  @del('/notifications/{id}/notificationobjects', {
    responses: {
      '200': {
        description: 'Notification.Notificationobject DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Notificationobject)) where?: Where<Notificationobject>,
  ): Promise<Count> {
    return this.notificationRepository.notificationobjects(id).delete(where);
  }
}
