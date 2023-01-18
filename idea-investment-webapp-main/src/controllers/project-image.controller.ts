import {getModelSchemaRef, patch, requestBody} from '@loopback/openapi-v3';
import {Filter, repository} from '@loopback/repository';
import {del, get, param, post} from '@loopback/rest';
import {toNumber} from 'lodash';
import {authenticate} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {ProjectImage} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {ProjectImageRepository} from '../repositories';
import {ProjectImageRequest} from './specs';

const PermissionKey = PermissionKeyResource.ProjectImage;

export class ProjectImageController {
  constructor(
    @repository(ProjectImageRepository)
    protected projectImageRepository: ProjectImageRepository,
  ) {}

  // @authenticate('jwt')
  @get('/project-images', {
    // security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Project Image model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectImage),
          },
        },
      },
    },
  })
  // @authorize({
  //   permissions: [PermissionKey.ViewProject],
  // })
  async find(
    @param.filter(ProjectImage) filter?: Filter<ProjectImage>,
  ): Promise<ProjectImage[]> {
    return this.projectImageRepository.find(filter);
  }

  @get('/project-images/{id}', {
    responses: {
      '200': {
        description: 'Project Image model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectImage),
          },
        },
      },
    },
  })
  async findOne(@param.path.number('id') id: number): Promise<ProjectImage> {
    return this.projectImageRepository.findById(id);
  }

  @authenticate('jwt')
  @post('/project-images', {
    responses: {
      '201': {
        description: 'Project Image model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectImage),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateProjectImage]})
  async create(
    @requestBody(ProjectImageRequest)
    project: Omit<ProjectImage, 'id'>,
  ): Promise<ProjectImage> {
    return this.projectImageRepository.create(project);
  }

  @authenticate('jwt')
  @patch('/project-images/{id}', {
    responses: {
      '200': {
        description: 'Project Image model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectImage),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProjectImage]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(ProjectImageRequest) projectImage: ProjectImage,
  ): Promise<void> {
    this.projectImageRepository.updateById(id, projectImage);
  }

  @authenticate('jwt')
  @del('/project-images/{id}', {
    responses: {
      '204': {
        description: 'Project Image Model DELETE',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteProjectImage]})
  async deleteById(@param.path.number('id') mediaId: any) {
    const data =  await this.projectImageRepository.findOne({where:{mediaId:mediaId}});
    const id = data?.id
    return this.projectImageRepository.deleteById(toNumber(id))
  }
}
