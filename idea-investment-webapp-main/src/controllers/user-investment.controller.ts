import {authenticate, AuthenticationBindings, TokenService, UserService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
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
import {UserProfile} from '@loopback/security';
import {authorize} from 'loopback4-authorization';
import {UserServiceBindings} from '../keys';
import {User, UserInvestment} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {Credentials, UserInvestmentRepository, UserRepository} from '../repositories';
import {UserManagementService} from '../services';
import {OPERATION_SECURITY_SPEC} from '../utils';


const PermissionKey: any = PermissionKeyResource.UserInvestments;
export class UserInvestmentController {
  constructor(
    @repository(UserInvestmentRepository)
    public userInvestmentRepository : UserInvestmentRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
  ) {}

  /**
   *
   * @param userInvestment
   * @returns  the created user investments
   */
  @authenticate('jwt')
  @post('/user-investments', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '201': {
        description: 'UserInvestment model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserInvestment, {
              title: 'NewUserInvestment',
              exclude: ['id'],
            }),
          },
        },
      },
    },
  })

  @authorize({permissions: ['*']}) //authorizes user to create investments
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserInvestment, {
            title: 'NewUserInvestment',
            exclude: ['id'],
          }),
        },
      },
    })
    //-------Getting current userID ---------//
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    //--------------------------------------//

    userInvestment: Omit<UserInvestment, 'id'>,
  ): Promise<UserInvestment> {
    const newInvestment = {...userInvestment, userId:currentUserProfile.id } //appends current userId to the requestBody
    return this.userInvestmentRepository.create(newInvestment);
  }

  /**
   *
   * @param where filters if additional filter data is porvided form the frontend.
   * @returns count of all the user-investments
   */
  @authenticate('jwt')
  @get('/user-investments/count',{
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'UserInvestment model count',
        content: {
          'application/json': {
            schema: CountSchema
          }
        },
      }
    }
  })


  @authorize({permissions: [PermissionKey.ViewUserInvestments]}) //authorizes user to count investments
  async count(
    @param.where(UserInvestment) where?: Where<UserInvestment>,
  ): Promise<Count> {
    return this.userInvestmentRepository.count(where);
  }

  /**
   *
   * @param filter filters if additional filter data is porvided form the frontend.
   * @returns all the user-investments data.
   */
  @authenticate('jwt')
  @get('/user-investments',{
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description:  'Array of UserInvestment model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserInvestment, {includeRelations: true}),
            },
          }
        },
      }
    }
  })
  @authorize({permissions: [PermissionKey.ViewUserInvestments]}) //authorizes user to access investments data
  async find(
    @param.filter(UserInvestment) filter?: Filter<UserInvestment>,
  ): Promise<UserInvestment[]> {
    return this.userInvestmentRepository.find(filter);
  }

  /**
   *
   * @param userInvestment
   * @param where acts as conditional expression.
   * @returns updated investment data.
   */
  @authenticate('jwt')
  @patch('/user-investments',{
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserInvestment PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  @authorize({permissions: ['*']}) //authorizes user to update investments
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserInvestment, {partial: true}),
        },
      },
    })
    userInvestment: UserInvestment,
    @param.where(UserInvestment) where?: Where<UserInvestment>,
  ): Promise<Count> {
    return this.userInvestmentRepository.updateAll(userInvestment, where);
  }

  /**
   *
   * @param id
   * @param filter filters if additional filter data is porvided form the frontend.
   * @returns a single investment record.
   */
  @authenticate('jwt')
  @get('/user-investments/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Article model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserInvestment, {includeRelations: true}),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUserInvestments]}) //authorizes user to find an investment.
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UserInvestment, {exclude: 'where'}) filter?: FilterExcludingWhere<UserInvestment>
  ): Promise<UserInvestment> {
    return this.userInvestmentRepository.findById(id, filter);
  }

  /**
   *
   * @param id
   * @param userInvestment
   */
  @authenticate('jwt')
  @patch('/user-investments/{id}',{
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserInvestment PATCH success',
      },
    },
  })
  @authorize({permissions: ['*']}) //authorizes user to update an investment.
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserInvestment, {partial: true}),
        },
      },
    })
    userInvestment: UserInvestment,
  ): Promise<void> {
    await this.userInvestmentRepository.updateById(id, userInvestment);
  }

  /**
   *
   * @param id
   * @param userInvestment
   */
  @authenticate('jwt')
  @put('/user-investments/{id}',{
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserInvestment PUT success',
      },
    },
  })
  @authorize({permissions: ['*']}) //authorizes user to update an investment.
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() userInvestment: UserInvestment,
  ): Promise<void> {
    await this.userInvestmentRepository.replaceById(id, userInvestment);
  }

  /**
   *
   * @param id
   */
  @authenticate('jwt')
  @del('/user-investments/{id}',{
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserInvestment PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteUserInvestments]}) //authorizes user to delete an investment
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userInvestmentRepository.deleteById(id);
  }
}
