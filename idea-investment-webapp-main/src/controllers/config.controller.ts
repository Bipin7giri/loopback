import {authenticate} from '@loopback/authentication';
import {
  OPERATION_SECURITY_SPEC
} from '@loopback/authentication-jwt';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {Config} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {ConfigRepository} from '../repositories';

const PermissionKey: any = PermissionKeyResource.Config;

export class ConfigController {
  constructor(
    @repository(ConfigRepository)
    public configRepository : ConfigRepository,
  ) {}

  @authenticate('jwt')
  @post('/admin/configs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Config model instance',
        content: {'application/json': {schema: getModelSchemaRef(Config)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateConfig]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Config, {
            title: 'NewConfig',
            exclude: ['id'],
          }),
        },
      },
    })
    config: Omit<Config, 'id'>,
  ): Promise<Config> {
    return this.configRepository.create(config);
  }

  @get('/admin/configs/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Config model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Config) where?: Where<Config>,
  ): Promise<Count> {
    return this.configRepository.count(where);
  }

  @get('/admin/configs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Config model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Config),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Config) filter?: Filter<Config>,
  ): Promise<Config[]> {
    return this.configRepository.find(filter);
  }

  @get('/configs', {
    responses: {
      '200': {
        description: 'Array of Config model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Config),
            },
          },
        },
      },
    },
  })
  async findConfigs(
    @param.filter(Config) filter?: Filter<Config>,
  ): Promise<Config[]> {
    return this.configRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/admin/configs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Config PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateConfig]})
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Config, {partial: true}),
        },
      },
    })
    config: Config,
    @param.where(Config) where?: Where<Config>,
  ): Promise<Count> {
    return this.configRepository.updateAll(config, where);
  }

  @authenticate('jwt')
  @get('/admin/configs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Config model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Config),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateConfig]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Config, {exclude: 'where'}) filter?: FilterExcludingWhere<Config>
  ): Promise<Config> {
    return this.configRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/admin/configs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Config PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateConfig]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Config, {partial: true}),
        },
      },
    })
    config: Config,
  ): Promise<void> {
    await this.configRepository.updateById(id, config);
  }

  @authenticate('jwt')
  @put('/admin/configs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Config PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateConfig]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() config: Config,
  ): Promise<void> {
    await this.configRepository.replaceById(id, config);
  }

  @authenticate('jwt')
  @del('/admin/configs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Config DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteConfig]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.configRepository.deleteById(id);
  }
}
