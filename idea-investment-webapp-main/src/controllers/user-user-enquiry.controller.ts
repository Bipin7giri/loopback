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
  User,
  UserEnquiry,
} from '../models';
import {UserRepository} from '../repositories';

export class UserUserEnquiryController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/user-enquiries', {
    responses: {
      '200': {
        description: 'Array of User has many UserEnquiry',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserEnquiry)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserEnquiry>,
  ): Promise<UserEnquiry[]> {
    return this.userRepository.userEnquiries(id).find(filter);
  }

  @post('/users/{id}/user-enquiries', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserEnquiry)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {
            title: 'NewUserEnquiryInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) userEnquiry: Omit<UserEnquiry, 'id'>,
  ): Promise<UserEnquiry> {
    return this.userRepository.userEnquiries(id).create(userEnquiry);
  }

  @patch('/users/{id}/user-enquiries', {
    responses: {
      '200': {
        description: 'User.UserEnquiry PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {partial: true}),
        },
      },
    })
    userEnquiry: Partial<UserEnquiry>,
    @param.query.object('where', getWhereSchemaFor(UserEnquiry)) where?: Where<UserEnquiry>,
  ): Promise<Count> {
    return this.userRepository.userEnquiries(id).patch(userEnquiry, where);
  }

  @del('/users/{id}/user-enquiries', {
    responses: {
      '200': {
        description: 'User.UserEnquiry DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserEnquiry)) where?: Where<UserEnquiry>,
  ): Promise<Count> {
    return this.userRepository.userEnquiries(id).delete(where);
  }
}
