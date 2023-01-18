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
import {authenticate} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {ProjectDetails} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {ProjectDetailsRepository} from '../repositories';

const PermissionKey = PermissionKeyResource.ProjectDetails;

export class ProjectDetailsController {
  constructor(
    @repository(ProjectDetailsRepository)
    public projectDetailsRepository: ProjectDetailsRepository,
  ) {}

  @authenticate('jwt')
  @get('/project-details', {
    responses: {
      ['200']: {
        description: 'Array of Project Details model instances',
        content: {
          ['application/json']: {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ProjectDetails),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProjectDetails]})
  async find(
    @param.filter(ProjectDetails) filter?: Filter<ProjectDetails>,
  ): Promise<ProjectDetails[]> {
    return this.projectDetailsRepository.findAll(filter);
  }

  @authenticate('jwt')
  @get('/project-details/{id}', {
    responses: {
      ['200']: {
        description: 'Project Details Model instances',
        content: {
          ['application/json']: {
            schema: getModelSchemaRef(ProjectDetails),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProjectDetails]})
  async findOne(
    @param.path.number('id') id: number,
    @param.filter(ProjectDetails) filter?: Filter<ProjectDetails>,
  ): Promise<ProjectDetails> {
    return this.projectDetailsRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @post('/project-details', {
    responses: {
      ['201']: {
        description: 'Project Details Create Success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateProjectDetails]})
  async create(
    @requestBody(ProjectDetails) projectDetails: Omit<ProjectDetails, 'id'>,
  ): Promise<ProjectDetails> {
    return this.projectDetailsRepository.create(projectDetails);
  }

  @authenticate('jwt')
  @patch('/project-details/{id}', {
    responses: {
      ['200']: {
        description: 'Project Details Update Success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProjectDetails]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(ProjectDetails) projectDetails: ProjectDetails,
  ): Promise<void> {
    return this.projectDetailsRepository.updateById(id, projectDetails);
  }

  @authenticate('jwt')
  @put('/project-details/{id}', {
    responses: {
      ['200']: {
        description: 'Project Details Replace Success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProjectDetails]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody(ProjectDetails) projectDetails: ProjectDetails,
  ): Promise<void> {
    return this.projectDetailsRepository.replaceById(id, projectDetails);
  }

  @authenticate('jwt')
  @del('/project-details/{id}', {
    responses: {
      ['204']: {
        description: 'Project Details Delete Success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProjectDetails]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.projectDetailsRepository.deleteById(id);
  }
}
