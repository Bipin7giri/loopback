import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {authenticate} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {
  Project,
  UserEnquiry
} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {ProjectRepository} from '../repositories';

const PermissionKey: any = PermissionKeyResource.Enquiries;


export class ProjectUserEnquiryController {
  constructor(
    @repository(ProjectRepository) protected projectRepository: ProjectRepository,
  ) { }
  @authenticate('jwt')
  @get('/projects/{id}/user-enquiries', {
    responses: {
      '200': {
        security: OPERATION_SECURITY_SPEC,
        description: 'Array of Project has many UserEnquiry',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserEnquiry)},
          },
        },
      },
    },
  })

  @authorize({permissions: [PermissionKey.ViewEnquiries]})
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserEnquiry>,
  ): Promise<UserEnquiry[]> {
    return this.projectRepository.userEnquiries(id).find(filter);
  }

  @authenticate('jwt')
  @post('/projects/{id}/user-enquiries', {
    responses: {
      '200': {
        security: OPERATION_SECURITY_SPEC,
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserEnquiry)}},
      },
    },
  })

  @authorize({permissions: [PermissionKey.CreateEnquiries]})
  async create(
    @param.path.number('id') id: typeof Project.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserEnquiry, {
            title: 'NewUserEnquiryInProject',
            exclude: ['id'],
            optional: ['projectId']
          }),
        },
      },
    }) userEnquiry: Omit<UserEnquiry, 'id'>,
  ): Promise<UserEnquiry> {
    return this.projectRepository.userEnquiries(id).create(userEnquiry);
  }

  @authenticate('jwt')
  @patch('/projects/{id}/user-enquiries', {
    responses: {
      '200': {
        security: OPERATION_SECURITY_SPEC,
        description: 'Project.UserEnquiry PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateEnquiries]})
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
    return this.projectRepository.userEnquiries(id).patch(userEnquiry, where);
  }

  @authenticate('jwt')
  @del('/projects/{id}/user-enquiries', {
    responses: {
      '200': {
        security: OPERATION_SECURITY_SPEC,
        description: 'Project.UserEnquiry DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })

  @authorize({permissions: [PermissionKey.DeleteEnquiries]})
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserEnquiry)) where?: Where<UserEnquiry>,
  ): Promise<Count> {
    return this.projectRepository.userEnquiries(id).delete(where);
  }
}
