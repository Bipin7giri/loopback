import {authenticate} from '@loopback/authentication';
import {UserServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  InclusionFilter,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {userFilters} from '../helpers/filters';
import {User} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {AddressRepository, UserRepository} from '../repositories';
import {UserManagementService} from '../services';
import {OPERATION_SECURITY_SPEC} from '../utils';
const PermissionKey: any = PermissionKeyResource.User;

@authenticate('jwt')
export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(AddressRepository)
    public addressRepository: AddressRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
  ) {}

  @get('/users/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users/count_by_country', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async countByCountry(): Promise<any> {
    const total = await this.addressRepository.execute(
      `SELECT  country, COUNT(*) FROM addresses GROUP BY country`,
    );
    return total;
  }

  @get('/users', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @get('/users/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    let include: InclusionFilter[] = userFilters;
    if (filter?.include) include = [...include, ...filter?.include];
    return this.userRepository.findById(id, {
      ...filter,
      include,
    });
  }

  /**
   *
   * @returns user details by userName
   */
  @get('/users/username/{username}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async getUserByUserName(
    @param.path.string('username') fullName: string,
  ): Promise<User | User[]> {
    const user = await this.userRepository.find({
      where: {
        fullName: {
          like: `%${fullName}%`,
        },
      },
    });
    return user;
  }

  // @authenticate('jwt')
  // @patch('/users/{id}')
  // @response(204, {
  //   security: OPERATION_SECURITY_SPEC,
  //   description: 'User PATCH success',
  // })

  /**
   * Update user status by admin
   * @param id represents user whose status is to be updated
   * @param user
   */
  @patch('/users/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateAnyUser]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: [
              'id',
              'createdOn',
              'modifiedOn',
              'deleted',
              'deletedBy',
              'deletedOn',
              'deletedBy',
              'email',
              'fullName',
              'isEmailVerified',
              'isPhoneVerified',
              'gender',
              'DOB',
              'token',
              'tokenExpiredDate',
              'refreshToken',
              'resetKey',
              'lastLogin',
              'phone',
              'tokenType',
              'googleId',
              'appleId',
              'profilePictureId',
            ],
            partial: true,
          }),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  /**
   *
   * @returns total new users this year
   */
  @get('/total-user/year', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'User model instance',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async findNewUsersThisYear(): Promise<any> {
    const countNewUsersThisYear = await this.userRepository.execute(
      `SELECT COUNT(*) FROM orders WHERE created_on >= date_trunc('year', CURRENT_DATE)`,
    );
    return countNewUsersThisYear[0];
  }

  /**
   *
   * @returns total new users this month
   */
  @get('/total-user/month', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'User model instance',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async findNewUsersThisMonth(): Promise<any> {
    const countNewUsersThisMonth = await this.userRepository.execute(
      `SELECT COUNT(*) FROM orders WHERE created_on >= date_trunc('month', CURRENT_DATE)`,
    );

    return countNewUsersThisMonth[0];
  }

  /**
   *
   * @returns total new users today
   */
  @get('/total-user/day', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'User model instance',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewUser]})
  async findInvestorsPerDay(): Promise<any> {
    const countUniqueInvestorsPerDay = await this.userRepository.execute(
      `SELECT COUNT(*) FROM orders WHERE created_on >= date_trunc('day', CURRENT_DATE)`,
    );

    return countUniqueInvestorsPerDay[0];
  }
}
