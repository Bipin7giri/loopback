import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {Filter, repository} from '@loopback/repository';
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
import {ProjectNews} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {ProjectNewsRepository, ProjectRepository} from '../repositories';
import {FAIL_RESPONSE} from '../types';
import {Slug} from '../utils';
import {ProjectNewsRequest, ProjectNewsRequestPatch} from './specs';

const PermissionKey: any = PermissionKeyResource.ProjectNews;

@authenticate('jwt')
export class ProjectNewsController {
  constructor(
    @repository(ProjectNewsRepository)
    public projectNewsRepository: ProjectNewsRepository,
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) {}

  @get('/project-news', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project News Entity Lists',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectNews),
          },
        },
      },
    },
  })
  @authorize({permissions: ['*']})
  find(
    @param.filter(ProjectNews) filter?: Filter<ProjectNews>,
  ): Promise<ProjectNews[]> {
    return this.projectNewsRepository.find(filter);
  }

  @get('/project-news/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project News Entity',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectNews),
          },
        },
      },
    },
  })
  @authorize({permissions: ['*']})
  findOne(@param.path.number('id') id: number): Promise<ProjectNews> {
    return this.projectNewsRepository.findById(id);
  }

  @post('/project-news', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '201': {
        description: 'Project News Entity',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectNews),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateProjectNews]})
  async create(
    @requestBody(ProjectNewsRequest) projectNews: Omit<ProjectNews, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER) author: UserProfile,
  ): Promise<ProjectNews | FAIL_RESPONSE> {
    const project = await this.projectRepository.findOne({
      where: {id: projectNews.projectId},
    });
    if (!project)
      return {
        fail: {
          statusCode: 404,
          message: 'Project EntityNotFound',
        },
      };
    return this.projectNewsRepository.create({
      ...projectNews,
      slug: Slug(projectNews.title),
      authorId: author.id,
    });
  }

  @patch('/project-news/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Project News Entity',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProjectNews]})
  updateOne(
    @param.path.number('id') id: number,
    @requestBody(ProjectNewsRequestPatch) projectNews: ProjectNews,
  ): Promise<void> {
    if (projectNews.title) {
      return this.projectNewsRepository.updateById(id, {
        ...projectNews,
        slug: Slug(projectNews.title),
      });
    }

    return this.projectNewsRepository.updateById(id, projectNews);
  }

  @put('/project-news/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Replace Project News Entity',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProjectNews]})
  replaceOne(
    @param.path.number('id') id: number,
    @requestBody(ProjectNewsRequest) projectNews: Omit<ProjectNews, 'id'>,
  ): Promise<void> {
    return this.projectNewsRepository.replaceById(id, {
      ...projectNews,
      slug: Slug(projectNews.title),
    });
  }

  @del('/project-news/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Delete Project News Entity',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteProjectNews]})
  deleteOne(@param.path.number('id') id: number): Promise<void> {
    return this.projectNewsRepository.deleteById(id);
  }
}
