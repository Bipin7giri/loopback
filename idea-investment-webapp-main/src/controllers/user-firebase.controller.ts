import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {Count, Filter, repository, Where} from '@loopback/repository';
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
import {UserProfile} from '@loopback/security';
import {authorize} from 'loopback4-authorization';
import {UserFirebase} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {UserFirebaseRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {UserFirebaseRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.UserFirebase;

@authenticate('jwt')
export class UserFirebaseController {
  constructor(
    @repository(UserFirebaseRepository)
    public userFirebaseRepository: UserFirebaseRepository,
  ) {}

  @get('/user-firebases', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserFirebase model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserFirebase),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUserFirebase]})
  findAll(
    @param.filter(UserFirebase) filter?: Filter<UserFirebase>,
  ): Promise<UserFirebase[]> {
    return this.userFirebaseRepository.find(filter);
  }

  @get('/user-firebases/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserFirebase model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserFirebase),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUserFirebase]})
  findOne(@param.path.number('id') id: number): Promise<UserFirebase> {
    return this.userFirebaseRepository.findById(id);
  }

  @get('/user-firebases/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserFirebase model instance count',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserFirebase),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUserFirebase]})
  count(
    @param.where(UserFirebase) where?: Where<UserFirebase>,
  ): Promise<Count> {
    return this.userFirebaseRepository.count(where);
  }

  @post('/user-firebases', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserFirebase model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(UserFirebase)},
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateUserFirebase]})
  async create(
    @requestBody(UserFirebaseRequest)
    userFirebase: Omit<UserFirebase, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<UserFirebase> {
    const hasFirebaseToken = await this.userFirebaseRepository.findOne({
      where: {
        userId: currentUserProfile.id,
        device: userFirebase.device,
      },
    });

    if (hasFirebaseToken) {
      await this.userFirebaseRepository.updateById(hasFirebaseToken.id, {
        token: userFirebase.token,
      });

      return await this.userFirebaseRepository.findById(hasFirebaseToken.id);
    }

    return await this.userFirebaseRepository.create({
      token: userFirebase.token,
      userId: currentUserProfile.id,
      device: userFirebase.device,
    });
  }

  @patch('/user-firebases/{id}', {
    responses: {
      security: OPERATION_SECURITY_SPEC,
      responses: {
        '200': {
          description: 'Firebase model instance',
          content: {
            'application/json': {schema: getModelSchemaRef(UserFirebase)},
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateUserFirebase]})
  updateById(
    @param.path.number('id') id: number,
    @requestBody(UserFirebaseRequest)
    userFirebaseBody: Omit<UserFirebase, 'id'>,
  ): Promise<void> {
    return this.userFirebaseRepository.updateById(id, userFirebaseBody);
  }

  @put('/user-firebases/{id}', {
    responses: {
      security: OPERATION_SECURITY_SPEC,
      responses: {
        '200': {
          description: 'UserFirebase model instance',
          content: {
            'application/json': {schema: getModelSchemaRef(UserFirebase)},
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateUserFirebase]})
  replaceById(
    @param.path.number('id') id: number,
    @requestBody(UserFirebaseRequest)
    userFirebaseBody: Omit<UserFirebase, 'id'>,
  ): Promise<void> {
    return this.userFirebaseRepository.replaceById(id, userFirebaseBody);
  }

  @del('/user-firebases/{id}', {
    responses: {
      security: OPERATION_SECURITY_SPEC,
      responses: {
        '204': {
          description: 'UserFirebase model instance',
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteUserFirebase]})
  deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.userFirebaseRepository.deleteById(id);
  }
}
