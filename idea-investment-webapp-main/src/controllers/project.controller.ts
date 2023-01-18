import {authenticate} from '@loopback/authentication';
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
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {projectsFilter, projectSingleFilter} from '../helpers/filters';
import {Project, ProjectDetails, ProjectNews} from '../models';
import {ProjectDTO} from '../models/dtos';
import {PermissionKeyResource} from '../permission-key.enum';
import {
  ProjectDetailsRepository,
  ProjectImageRepository,
  ProjectNewsRepository,
  ProjectRepository,
} from '../repositories';
import {OPERATION_SECURITY_SPEC, Slug} from '../utils';
import {ProjectAndDetailRequest, ProjectAndDetailsRequestPatch} from './specs';

const PermissionKey: any = PermissionKeyResource.Project;

export class ProjectController {
  constructor(
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
    @repository(ProjectImageRepository)
    public projectImageRepository: ProjectImageRepository,
    @repository(ProjectDetailsRepository)
    public projectDetailsRepository: ProjectDetailsRepository,
    @repository(ProjectNewsRepository)
    public projectNewsRepository: ProjectNewsRepository,
  ) {}

  @authenticate('jwt')
  @post('/admin/projects', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(Project)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateProject]})
  async create(
    @requestBody(ProjectAndDetailRequest)
    projectBody: Omit<Project, 'id'>,
  ): Promise<any> {
    const {content, imageId, title, newsContent, authorId, ...remainBody} =
      projectBody;

    const project = await this.projectRepository.createProjectAndDetail(
      remainBody,
      content,
    );
    const projectId = project?.id;
    if (title && newsContent && authorId) {
      const projectNews = await this.projectNewsRepository.create({
        title: title,
        content: newsContent,
        slug: Slug(title),
        authorId: 1,
        projectId: projectId,
      });
    }

    //  for projectImage upload
    for (let i = 0; i < imageId?.length; i++) {
      await this.projectImageRepository.create({
        projectId: projectId,
        mediaId: imageId[i],
      });
    }
    return project;
  }

  @authenticate('jwt')
  @get('/projects/{id}/project-details', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project Details model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectDetails),
          },
        },
      },
    },
  })
  @authorize({
    permissions: [PermissionKeyResource.ProjectDetails.ViewProjectDetails],
  })
  async findProjectDetails(
    @param.path.number('id') id: number,
  ): Promise<ProjectDetails | null> {
    return this.projectRepository.findProjectDetailByProjectId(id);
  }

  @authenticate('jwt')
  @get('/projects/{id}/project-news', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project News model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectNews),
          },
        },
      },
    },
  })
  @authorize({
    permissions: ['*'],
  })
  async findProjectNews(
    @param.path.number('id') id: number,
  ): Promise<ProjectDetails[]> {
    return this.projectRepository.findProjectNewsByProjectId(id);
  }

  @authenticate('jwt')
  @get('/admin/projects/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProject]})
  count(@param.where(Project) where?: Where<Project>): Promise<Count> {
    return this.projectRepository.count(where);
  }

  @authenticate('jwt')
  @get('/admin/projects', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Project model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Project),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProject]})
  find(@param.filter(Project) filter?: Filter<Project>): Promise<Project[]> {
    let include: InclusionFilter[] = projectsFilter;
    if (filter?.include) include = [...include, ...filter?.include];

    return this.projectRepository.find({
      ...filter,
      where: {...filter?.where},
      include,
    });
  }

  @get('/projects/count', {
    responses: {
      '200': {
        description: 'Project model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProject]})
  countProjects(@param.where(Project) where?: Where<Project>): Promise<Count> {
    where = {...where, isActive: true};
    return this.projectRepository.count(where);
  }

  @get('/projects', {
    responses: {
      '200': {
        description: 'Array of Project model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Project),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProject]})
  findProjects(
    @param.filter(Project) filter?: Filter<Project>,
  ): Promise<Project[]> {
    let include: InclusionFilter[] = projectsFilter;
    if (filter?.include) include = [...include, ...filter?.include];

    return this.projectRepository.find({
      ...filter,
      where: {isActive: true},
      include,
    });
  }

  @get('/projects/{id}', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Project),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProject]})
  async findProjectById(
    @param.path.number('id') id: number,
    @param.filter(Project, {exclude: 'where'})
    filter?: FilterExcludingWhere<Project>,
  ): Promise<ProjectDTO> {
    let include: InclusionFilter[] = projectSingleFilter;
    if (filter?.include) include = [...include, ...filter?.include];
    const project = await this.projectRepository.findById(id, {
      ...filter,
      include,
    });
    // let contentId = project.id;
    const data = await this.projectDetailsRepository.find({
      where: {projectId: project.id},
    });

    project.content = data[0]?.content || null;
    return new ProjectDTO(project);
  }

  @authenticate('jwt')
  @get('/admin/projects/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Project model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Project),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewProject]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Project, {exclude: 'where'})
    filter?: FilterExcludingWhere<ProjectDTO>,
  ): Promise<Project> {
    let include: InclusionFilter[] = projectSingleFilter;
    if (filter?.include) include = [...include, ...filter?.include];
    const project = await this.projectRepository.findById(id, {
      ...filter,
      include,
    });
    // let contentId = project.id;
    const data = await this.projectDetailsRepository.find({
      where: {projectId: project.id},
    });

    project.content = data[0]?.content || null;
    return new ProjectDTO(project);
  }

  @authenticate('jwt')
  @patch('/admin/projects/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Project PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProject]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(ProjectAndDetailsRequestPatch)
    project: Project,
  ): Promise<void> {
    const {content, imageId, title, newsContent, authorId, ...remainBody} =
      project;
    const projectNewsPayload = {title, content: newsContent, authorId};
    if (!title) delete projectNewsPayload.title;
    if (!newsContent) delete projectNewsPayload.content;
    if (!authorId) delete projectNewsPayload.authorId;

    for (let i = 0; i < imageId?.length; i++) {
      await this.projectImageRepository.create({
        projectId: id,
        mediaId: imageId[i],
      });
    }
    const projectNewsId: any = await this.projectNewsRepository.findOne({
      where: {
        projectId: id,
      },
    });
    // if (!projectNewsId) throw new HttpErrors.NotFound('No entity found');
    if (projectNewsId) {
      const updateProjectNews = await this.projectNewsRepository.updateById(
        projectNewsId?.id,
        projectNewsPayload,
      );
    }

    return this.projectRepository.updateProjectAndDetailsById(
      id,
      remainBody,
      content,
    );
  }

  @authenticate('jwt')
  @put('/admin/projects/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Project PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateProject]})
  replaceById(
    @param.path.number('id') id: number,
    @requestBody(Project) project: Project,
  ): Promise<void> {
    const {content, ...remainBody} = project;
    return this.projectRepository.replaceProjectAndDetailsById(
      id,
      remainBody,
      content,
    );
  }

  @authenticate('jwt')
  @del('/admin/projects/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Project DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteProject]})
  deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.projectRepository.deleteProjectAndDetailsById(id);
  }
}
