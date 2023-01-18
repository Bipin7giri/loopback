import {authenticate, AuthenticationBindings} from '@loopback/authentication';
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
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {authorize} from 'loopback4-authorization';
import {Address} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {AddressRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {AddressRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Address;

@authenticate('jwt')
export class AddressController {
  constructor(
    @repository(AddressRepository)
    public addressRepository: AddressRepository,
  ) {}

  @post('/addresses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Address model instance',
        content: {'application/json': {schema: getModelSchemaRef(Address)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateAddress]})
  create(
    @requestBody(AddressRequest)
    address: Omit<Address, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Address> {
    return this.addressRepository.create({
      ...address,
      userId: currentUserProfile.id,
    });
  }

  @get('/addresses/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Address model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewAddress]})
  count(@param.where(Address) where?: Where<Address>): Promise<Count> {
    return this.addressRepository.count(where);
  }

  @get('/addresses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Address model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Address),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewAddress]})
  find(@param.filter(Address) filter?: Filter<Address>): Promise<Address[]> {
    return this.addressRepository.find(filter);
  }

  @patch('/addresses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Address PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateAddress]})
  updateAll(
    @requestBody(AddressRequest)
    address: Address,
    @param.where(Address) where?: Where<Address>,
  ): Promise<Count> {
    return this.addressRepository.updateAll(address, where);
  }

  @get('/addresses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Address model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Address),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateAddress]})
  findById(
    @param.path.number('id') id: number,
    @param.filter(Address, {exclude: 'where'})
    filter?: FilterExcludingWhere<Address>,
  ): Promise<Address> {
    return this.addressRepository.findById(id, filter);
  }

  @patch('/addresses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Address PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateAddress]})
  updateById(
    @param.path.number('id') id: number,
    @requestBody(AddressRequest)
    address: Address,
  ): Promise<void> {
    return this.addressRepository.updateById(id, address);
  }

  @put('/addresses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Address PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateAddress]})
  replaceById(
    @param.path.number('id') id: number,
    @requestBody(AddressRequest) address: Address,
  ): Promise<void> {
    return this.addressRepository.replaceById(id, address);
  }

  @del('/addresses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Address DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateAddress]})
  deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.addressRepository.deleteById(id);
  }
}
