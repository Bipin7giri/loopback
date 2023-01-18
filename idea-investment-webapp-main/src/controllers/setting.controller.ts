import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
  repository
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {Settings} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {SettingsRepository} from '../repositories';
const PermissionKey: any = PermissionKeyResource.Settings;

export class SettingController {
  constructor(
    @repository(SettingsRepository)
    public settingsRepository: SettingsRepository,
  ) { }
  @authenticate('jwt')
  @post('/admin/settings')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Settings model instance',
    content: {'application/json': {schema: getModelSchemaRef(Settings)}},
  })
  @authorize({permissions: [PermissionKey.CreateSettings]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Settings, {
            title: 'NewSettings',
            exclude: ['id', 'created_on', 'modified_on', 'deleted', 'deleted_by', 'deleted_on', 'deleted_by'],
          }),
        },
      },
    })
    settings: Omit<Settings, 'id'>,
  ): Promise<Settings> {
    return this.settingsRepository.create(settings);
  }
  @authenticate('jwt')
  @get('/admin/settings/count')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Settings model count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.ViewSetting]})
  async count(
    @param.where(Settings) where?: Where<Settings>,
  ): Promise<Count> {
    return this.settingsRepository.count({where: {deleted: false}});
  }
  @authenticate('jwt')
  @get('/admin/settings')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Array of Settings model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Settings, {includeRelations: true}),
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewSetting]})
  async find(
    @param.filter(Settings) filter?: Filter<Settings>,
  ): Promise<Settings[]> {
    return this.settingsRepository.find({...filter, where: {deleted: false}});
  }

  @authenticate('jwt')
  @patch('/admin/settings')
  @response(200, {
    description: 'Settings PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.UpdateSettings]})
  async updateAll(
    @requestBody({
      content: {
        security: OPERATION_SECURITY_SPEC,
        'application/json': {
          schema: getModelSchemaRef(Settings, {
            title: 'Partner',
            exclude: ['id', 'created_on', 'modified_on', 'deleted', 'deleted_by', 'deleted_on', 'deleted_by'],
            partial: true
          },),
        },
      },
    })

    settings: Settings,
    @param.where(Settings) where?: Where<Settings>,
  ): Promise<Count> {
    return this.settingsRepository.updateAll(settings, where);
  }

  @authenticate('jwt')
  @get('/admin/settings/{id}')
  @response(200, {
    description: 'Settings model instance',
    content: {
      security: OPERATION_SECURITY_SPEC,
      'application/json': {
        schema: getModelSchemaRef(Settings, {includeRelations: true}),
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewSetting]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Settings, {exclude: 'where'}) filter?: FilterExcludingWhere<Settings>
  ): Promise<Settings> {
    return this.settingsRepository.findById(id, filter);
  }
  @authenticate('jwt')
  @patch('/admin/settings/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Settings PATCH success',
  })
  @authorize({permissions: [PermissionKey.UpdateSettings]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Settings, {
            title: 'Partner',
            exclude: ['id', 'created_on', 'modified_on', 'deleted', 'deleted_by', 'deleted_on', 'deleted_by'],
            partial: true
          },),
        },
      },
    })
    settings: Settings,
  ): Promise<void> {
    await this.settingsRepository.updateById(id, settings);
  }
  @authenticate('jwt')
  @put('/admin/settings/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Settings PUT success',
  })
  @authorize({permissions: [PermissionKey.UpdateSettings]})

  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() settings: Settings,
  ): Promise<void> {
    await this.settingsRepository.replaceById(id, settings);
  }
  @authenticate('jwt')
  @del('/admin/settings/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Settings DELETE success',
  })
  @authorize({permissions: [PermissionKey.UpdateSettings]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.settingsRepository.updateById(id, {deleted: true, deleted_by: 'admin', deleted_on: ` ${new Date()}`});
  }
}
