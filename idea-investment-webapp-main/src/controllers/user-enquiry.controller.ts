import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
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
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {authorize} from 'loopback4-authorization';
import {userEnquiryFilter} from '../helpers/filters/userEnquiry.filters';
import {UserEnquiry} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {UserEnquiryRepository} from '../repositories';

const PermissionKey: any = PermissionKeyResource.Enquiries;

export class UserEnquiryController {
  constructor(
    @repository(UserEnquiryRepository)
    public userEnquiryRepository: UserEnquiryRepository,
  ) {}

  /**
   *
   * @param userEnquiry
   * @param currentUserProfile is useful to get id of the currentUser
   * @returns the newly created user-enquiries
   */
  @authenticate('jwt')
  @post('/user-enquiries')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserEnquiry)}},
  })
  //authorise user to create an enquiry
  @authorize({permissions: [PermissionKey.CreateEnquiries]})
  async create(
    // parameter inside requestBody are for Swagger UI.
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {
            title: 'NewUserEnquiry',
            exclude: [
              'id',
              'userId',
              'createdOn',
              'modifiedOn',
              'deleted',
              'deletedBy',
              'deletedOn',
              'deletedBy',
            ],
          }),
        },
      },
    })
    userEnquiry: UserEnquiry,
    //-------Getting current userID ---------//
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    //--------------------------------------//
  ): Promise<UserEnquiry> {
    return this.userEnquiryRepository.create({
      ...userEnquiry,
      userId: currentUserProfile.id,
    });
  }

  /**
   *
   * @param where filters if filter parameter is provided
   * @returns count of user-enquiries
   */
  @authenticate('jwt')
  @get('/user-enquiries/count')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry model count',
    content: {'application/json': {schema: CountSchema}},
  })
  //authorize user to view an enquiry
  @authorize({permissions: [PermissionKey.ViewEnquiries]})
  async count(
    @param.where(UserEnquiry) where?: Where<UserEnquiry>,
  ): Promise<Count> {
    return this.userEnquiryRepository.count(where);
  }

  /**
   *
   * @param filter filters if filter parameter is provided
   * @returns all user-enquiries
   */
  @authenticate('jwt')
  @get('/user-enquiries')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Array of UserEnquiry model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserEnquiry, {includeRelations: true}),
        },
      },
    },
  })
  //authorizes user to view an enquiry
  @authorize({permissions: [PermissionKey.ViewEnquiries]})
  async find(
    @param.filter(UserEnquiry) filter?: Filter<UserEnquiry>,
  ): Promise<UserEnquiry[]> {
    let include: InclusionFilter[] = userEnquiryFilter;
    if (filter?.include) include = [...include, ...filter?.include];
    return this.userEnquiryRepository.find({
      ...filter,
      where: {...filter?.where},
      include,
    });
  }

  /**
   *
   * @param userEnquiry
   * @param where acts as conditional expression.
   * @returns updated user-enquiries
   */
  @authenticate('jwt')
  @patch('/user-enquiries')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  //authorizes user to update an enquiry
  @authorize({permissions: [PermissionKey.UpdateEnquiries]})
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {partial: true}),
        },
      },
    })
    userEnquiry: UserEnquiry,
    @param.where(UserEnquiry) where?: Where<UserEnquiry>,
  ): Promise<Count> {
    return this.userEnquiryRepository.updateAll(userEnquiry, where);
  }

  /**
   *
   * @param id
   * @param filter filters if filter parameter is provided
   * @returns an user-enquiry
   */
  @authenticate('jwt')
  @get('/user-enquiries/{id}')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserEnquiry, {includeRelations: true}),
      },
    },
  })
  //authorizes user to view an enquiry
  @authorize({permissions: [PermissionKey.ViewEnquiries]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UserEnquiry, {exclude: 'where'})
    filter?: FilterExcludingWhere<UserEnquiry>,
  ): Promise<UserEnquiry> {
    return this.userEnquiryRepository.findById(id, filter);
  }

  /**
   *
   * @param id
   * @param userEnquiry
   */
  @authenticate('jwt')
  @patch('/user-enquiries/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry PATCH success',
  })
  //authorizes user to update an enquiry
  @authorize({permissions: [PermissionKey.UpdateEnquiries]})
  async updateById(
    @param.path.number('id') id: number,
    // parameter inside requestBody are for Swagger UI.
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {
            exclude: [
              'id',
              'userId',
              'createdOn',
              'modifiedOn',
              'deleted',
              'deletedBy',
              'deletedOn',
              'deletedBy',
            ],
            partial: true,
          }),
        },
      },
    })
    userEnquiry: UserEnquiry,
  ): Promise<void> {
    await this.userEnquiryRepository.updateById(id, userEnquiry);
  }

  /**
   *
   * @param id
   * @param userEnquiry
   */
  @authenticate('jwt')
  @put('/user-enquiries/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry PUT success',
  })
  //authorizes user to update an enquiry
  @authorize({permissions: [PermissionKey.UpdateEnquiries]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody({
      // parameter inside requestBody are for Swagger UI.
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {
            exclude: [
              'id',
              'createdOn',
              'modifiedOn',
              'deleted',
              'deletedBy',
              'deletedOn',
              'deletedBy',
            ],
          }),
        },
      },
    })
    userEnquiry: UserEnquiry,
  ): Promise<void> {
    await this.userEnquiryRepository.replaceById(id, userEnquiry);
  }

  /**
   *
   * @param id
   */
  @authenticate('jwt')
  @del('/user-enquiries/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'UserEnquiry DELETE success',
  })
  //authorizes user to delete an enquiry
  @authorize({permissions: [PermissionKey.DeleteEnquiries]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userEnquiryRepository.deleteById(id);
  }
}
