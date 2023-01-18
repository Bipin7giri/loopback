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
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import slug from 'slug';
import {Role} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {RoleRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {RoleRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.User;

export class RoleController {
  constructor(
    @repository(RoleRepository) public roleRepository: RoleRepository,
  ) {}

  @authenticate('jwt')
  @post('/admin/roles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Role model instance',
        content: {
          'application/json': {schema: {'x-ts-type': Role}},
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateRole]})
  async create(
    @requestBody(RoleRequest)
    role: Omit<Role, 'id'>,
  ): Promise<Role> {
    if (role.name) role.slug = slug(role.name);
    return this.roleRepository.create(role);
  }

  @authenticate('jwt')
  @get('/admin/roles/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Role model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewRole]})
  async count(@param.where(Role) where?: Where<Role>): Promise<Count> {
    return this.roleRepository.count(where);
  }

  @authenticate('jwt')
  @get('/admin/roles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Array of Role model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Role),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewRole]})
  async find(@param.filter(Role) filter?: Filter<Role>): Promise<Role[]> {
    return this.roleRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/admin/roles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Role PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateRole]})
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {partial: true}),
        },
      },
    })
    role: Role,
    @param.where(Role) where?: Where<Role>,
  ): Promise<Count> {
    return this.roleRepository.updateAll(role, where);
  }

  @authenticate('jwt')
  @get('/admin/roles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Role model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Role),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewRole]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Role, {exclude: 'where'}) filter?: FilterExcludingWhere<Role>,
  ): Promise<Role> {
    return this.roleRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/admin/roles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Role PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateRole]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(RoleRequest)
    role: Role,
  ): Promise<void> {
    if (role.name) role.slug = slug(role.name);
    await this.roleRepository.updateById(id, role);
  }

  @authenticate('jwt')
  @put('/admin/roles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Role PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateRole]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() role: Role,
  ): Promise<void> {
    if (role.name) role.slug = slug(role.name);
    await this.roleRepository.replaceById(id, role);
  }

  @authenticate('jwt')
  @del('/admin/roles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Role DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteRole]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.roleRepository.deleteById(id);
  }

  @get('/roles/permissions', {
    responses: {
      200: {
        description: 'Role permission',
      },
    },
  })
  async getPermissions(): Promise<any> {
    const result: any = {
      ...PermissionKeyResource,
    };
    const response = [];
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        response.push({
          name: key,
          value: Object.keys(result[key]).map(index => result[key][index]),
        });
      }
    }
    return response;
  }
}
