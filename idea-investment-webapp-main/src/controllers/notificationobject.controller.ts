import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {Notificationobject} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {NotificationobjectRepository} from '../repositories';

const PermissionKey: any = PermissionKeyResource.Notification;
export class NotificationobjectController {
  constructor(
    @repository(NotificationobjectRepository)
    public notificationobjectRepository: NotificationobjectRepository,
  ) {}
  @authenticate('jwt')
  @post('/notificationobjects')
  @response(200, {
    description: 'Notificationobject model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(Notificationobject)},
    },
  })
  @authorize({permissions: [PermissionKey.CreateNotification]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notificationobject, {
            title: 'NewNotificationobject',
            exclude: ['id'],
          }),
        },
      },
    })
    notificationobject: Omit<Notificationobject, 'id'>,
  ): Promise<Notificationobject> {
    return this.notificationobjectRepository.create(notificationobject);
  }

  @authenticate('jwt')
  @get('/notificationobjects/count')
  @response(200, {
    description: 'Notificationobject model count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.ViewNotification]})
  async count(
    @param.where(Notificationobject) where?: Where<Notificationobject>,
  ): Promise<Count> {
    return this.notificationobjectRepository.count(where);
  }

  @authenticate('jwt')
  @get('/notificationobjects')
  @response(200, {
    description: 'Array of Notificationobject model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Notificationobject, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewNotification]})
  async find(
    @param.filter(Notificationobject) filter?: Filter<Notificationobject>,
  ): Promise<Notificationobject[]> {
    return this.notificationobjectRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/notificationobjects')
  @response(200, {
    description: 'Notificationobject PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.UpdateNotification]})
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notificationobject, {partial: true}),
        },
      },
    })
    notificationobject: Notificationobject,
    @param.where(Notificationobject) where?: Where<Notificationobject>,
  ): Promise<Count> {
    return this.notificationobjectRepository.updateAll(
      notificationobject,
      where,
    );
  }

  @authenticate('jwt')
  @get('/notificationobjects/{id}')
  @response(200, {
    description: 'Notificationobject model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Notificationobject, {includeRelations: true}),
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewNotification]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Notificationobject, {exclude: 'where'})
    filter?: FilterExcludingWhere<Notificationobject>,
  ): Promise<Notificationobject> {
    return this.notificationobjectRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/notificationobjects/{id}')
  @response(204, {
    description: 'Notificationobject PATCH success',
  })
  @authorize({permissions: [PermissionKey.UpdateNotification]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notificationobject, {partial: true}),
        },
      },
    })
    notificationobject: Notificationobject,
  ): Promise<void> {
    await this.notificationobjectRepository.updateById(id, notificationobject);
  }

  @authenticate('jwt')
  @put('/notificationobjects/{id}')
  @response(204, {
    description: 'Notificationobject PUT success',
  })
  @authorize({permissions: [PermissionKey.UpdateNotification]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() notificationobject: Notificationobject,
  ): Promise<void> {
    await this.notificationobjectRepository.replaceById(id, notificationobject);
  }
  @authenticate('jwt')
  @del('/notificationobjects/{id}')
  @response(204, {
    description: 'Notificationobject DELETE success',
  })
  @authorize({permissions: [PermissionKey.DeleteNotification]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.notificationobjectRepository.deleteById(id);
  }
}
