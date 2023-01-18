import {authenticate} from '@loopback/authentication';
import {UserRepository} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
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
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {NOTIFICATION_STATUS} from '../enums';
import {Notification} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {
  NotificationobjectRepository,
  NotificationRepository,
} from '../repositories';
import {handleNofication} from '../services/notification.service';
import {NotificationTemplate, NotificationTemplatePostRequest} from './specs';
const PermissionKey: any = PermissionKeyResource.Notification;

export class NotificationController {
  constructor(
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(NotificationobjectRepository)
    public notificationobjectRepository: NotificationobjectRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}
  @authenticate('jwt')
  @post('/notifications')
  @response(200, {
    description: 'Notification model instance',
    content: {'application/json': {schema: getModelSchemaRef(Notification)}},
  })
  @authorize({permissions: [PermissionKey.CreateNotification]})
  async create(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @requestBody(NotificationTemplatePostRequest)
    notification: Omit<Notification, 'id'>,
  ): Promise<any> {
    const {key, value, ...remainBody}: any = notification;
    const notificationId = await this.notificationRepository.create({
      title: remainBody?.title,
      image: remainBody?.image,
      body: remainBody?.body,
      status:
        remainBody.status === NOTIFICATION_STATUS.save
          ? NOTIFICATION_STATUS.save
          : NOTIFICATION_STATUS.unpublish,
      device: remainBody?.device,
      notifierId: remainBody?.notifierId,
    });

    const notificationObjectPayload =
      await this.notificationobjectRepository.create({
        key: key,
        value: value,
        notificationId: notificationId.id,
      });

    if (remainBody.notifierId) {
      const userFireBaseId: any = await this.userRepository.findById(
        remainBody.notifierId,
      );

      const notificationPayload = {
        // change the to key for individual user
        registration_ids: [userFireBaseId.userFireBaseId],
        notification: {
          body: remainBody.body,
          title: remainBody.title,
          image: remainBody.image,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          type: key,
          value: value,
        },
      };
      if (remainBody.status === NOTIFICATION_STATUS.publish) {
        if (userFireBaseId === null) {
          throw new HttpErrors[404]();
        }
        if (userFireBaseId?.userFireBaseId === null) {
          throw new HttpErrors.NotFound(`Device Id not found`);
        }

        if (
          userFireBaseId?.isLogin === null ||
          userFireBaseId?.isLogin === false
        ) {
          throw new HttpErrors.NotFound(`User is currently Logout`);
        }
        const notification = await handleNofication(notificationPayload);
        if (notification) {
          await this.notificationRepository.updateById(notificationId.id, {
            status: NOTIFICATION_STATUS.publish,
          });
        }
        return notification;
      }
    } else {
      const notificationPayload = {
        to: '/topics/new-user',
        notification: {
          body: remainBody.body,
          title: remainBody.title,
          image: remainBody.image,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          type: key,
          value: value,
        },
      };
      if (remainBody.status === NOTIFICATION_STATUS.publish) {
        const notification = await handleNofication(notificationPayload);
        if (notification) {
          await this.notificationRepository.updateById(notificationId.id, {
            status: NOTIFICATION_STATUS.publish,
          });
        }
        return notification;
      }
    }

    response.json({
      statusCode: 204,
      message: 'Sucessfully Added notification',
    });
    return response;
  }
  @authenticate('jwt')
  @get('/notifications/count')
  @response(200, {
    description: 'Notification model count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.ViewNotification]})
  async count(
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationRepository.count(where);
  }

  @authenticate('jwt')
  @get('/notifications')
  @response(200, {
    description: 'Array of Notification model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Notification, {includeRelations: true}),
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewNotification]})
  async find(
    @param.filter(Notification) filter?: Filter<Notification>,
  ): Promise<Notification[]> {
    return this.notificationRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/notifications')
  @response(200, {
    description: 'Notification PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.UpdateNotification]})
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {partial: true}),
        },
      },
    })
    notification: Notification,
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationRepository.updateAll(notification, where);
  }

  @authenticate('jwt')
  @get('/notifications/{id}')
  @response(200, {
    description: 'Notification model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Notification, {includeRelations: true}),
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewNotification]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Notification, {exclude: 'where'})
    filter?: FilterExcludingWhere<Notification>,
  ): Promise<Notification> {
    return this.notificationRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/notifications/{id}')
  @response(204, {
    description: 'Notification PATCH success',
  })
  @authorize({permissions: [PermissionKey.UpdateNotification]})
  async updateById(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.number('id') id: number,
    @requestBody(NotificationTemplate)
    notification: Notification,
  ): Promise<any> {
    const {key, value, ...remainBody}: any = notification;
    const notificationPatch = await this.notificationRepository.updateById(
      id,
      remainBody,
    );
    const notificationObjectId: any =
      await this.notificationobjectRepository.findOne({
        where: {
          notificationId: id,
        },
      });
    await this.notificationobjectRepository.updateById(
      notificationObjectId.id,
      {
        key: key,
        value: value,
      },
    );

    const notificationPayload = {
      to: '/topics/new-user',
      notification: {
        body: remainBody.body,
        title: remainBody.title,
        image: remainBody.image,
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        type: key,
        value: value,
      },
    };
    if (remainBody.status === NOTIFICATION_STATUS.publish) {
      const notification = await handleNofication(notificationPayload);
      return notification;
    }
    response.json({
      statusCode: 204,
      message: 'Sucessfully Updated notification',
    });
    return response;
  }

  @authenticate('jwt')
  @put('/notifications/{id}')
  @response(204, {
    description: 'Notification PUT success',
  })
  @authorize({permissions: [PermissionKey.UpdateNotification]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() notification: Notification,
  ): Promise<void> {
    await this.notificationRepository.replaceById(id, notification);
  }

  @authenticate('jwt')
  @del('/notifications/{id}')
  @response(204, {
    description: 'Notification DELETE success',
  })
  @authorize({permissions: [PermissionKey.DeleteNotification]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.notificationRepository.deleteById(id);
  }
}
