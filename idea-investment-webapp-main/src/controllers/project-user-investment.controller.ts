import {authenticate} from '@loopback/authentication';
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
import {
  Project,
  UserInvestment
} from '../models';
import {ProjectRepository} from '../repositories';

// const PermissionKey: any = PermissionKeyResource.Article;

export class ProjectUserInvestmentController {
  constructor(
    @repository(ProjectRepository) protected projectRepository: ProjectRepository,
  ) { }

  @authenticate('jwt')
  @get('/projects/{id}/user-investments', {
    responses: {
      '200': {
        description: 'Array of Project has many UserInvestment',
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
    return this.projectRepository.userInvestments(id).find(filter);
  }

  @post('/projects/{id}/user-investments', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserInvestment)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Project.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserInvestment, {
            title: 'NewUserInvestmentInProject',
            exclude: ['id'],
            optional: ['projectId']
          }),
        },
      },
    }) userInvestment: Omit<UserInvestment, 'id'>,
  ): Promise<UserInvestment> {
    return this.projectRepository.userInvestments(id).create(userInvestment);
  }

  @patch('/projects/{id}/user-investments', {
    responses: {
      '200': {
        description: 'Project.UserInvestment PATCH success count',
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
    return this.projectRepository.userInvestments(id).patch(userInvestment, where);
  }

  @del('/projects/{id}/user-investments', {
    responses: {
      '200': {
        description: 'Project.UserInvestment DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserInvestment)) where?: Where<UserInvestment>,
  ): Promise<Count> {
    return this.projectRepository.userInvestments(id).delete(where);
  }
}
