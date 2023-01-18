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
  UserInvestment,
} from '../models';
import {UserRepository} from '../repositories';

export class UserUserInvestmentController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/user-investments', {
    responses: {
      '200': {
        description: 'Array of User has many UserInvestment',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserInvestment)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserInvestment>,
  ): Promise<UserInvestment[]> {
    return this.userRepository.userInvestments(id).find(filter);
  }

  @post('/users/{id}/user-investments', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserInvestment)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserInvestment, {
            title: 'NewUserInvestmentInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) userInvestment: Omit<UserInvestment, 'id'>,
  ): Promise<UserInvestment> {
    return this.userRepository.userInvestments(id).create(userInvestment);
  }

  @patch('/users/{id}/user-investments', {
    responses: {
      '200': {
        description: 'User.UserInvestment PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserInvestment, {partial: true}),
        },
      },
    })
    userInvestment: Partial<UserInvestment>,
    @param.query.object('where', getWhereSchemaFor(UserInvestment)) where?: Where<UserInvestment>,
  ): Promise<Count> {
    return this.userRepository.userInvestments(id).patch(userInvestment, where);
  }

  @del('/users/{id}/user-investments', {
    responses: {
      '200': {
        description: 'User.UserInvestment DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserInvestment)) where?: Where<UserInvestment>,
  ): Promise<Count> {
    return this.userRepository.userInvestments(id).delete(where);
  }
}
