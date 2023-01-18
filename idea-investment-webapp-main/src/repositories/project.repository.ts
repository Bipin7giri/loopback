import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ORDERSTATUS} from '../enums';
import {
  Company,
  Media,
  Order,
  Project,
  ProjectDetails,
  ProjectImage,
  ProjectNews,
  ProjectRelations,
  UserEnquiry,
  UserInvestment,
} from '../models';
import {
  CompanyRepository,
  MediaRepository,
  OrderRepository,
  ProjectDetailsRepository,
  ProjectImageRepository,
  ProjectNewsRepository,
} from '../repositories';
import {Slug, softExclude} from '../utils';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';
import {UserEnquiryRepository} from './user-enquiry.repository';
import {UserInvestmentRepository} from './user-investment.repository';

export class ProjectRepository extends DefaultBaseEntityCrudRepository<
  Project,
  typeof Project.prototype.id,
  ProjectRelations
> {
  public readonly investments: HasManyRepositoryFactory<
    Order,
    typeof Project.prototype.id
  >;

  public readonly company: BelongsToAccessor<
    Company,
    typeof Project.prototype.id
  >;

  public readonly newsId: HasOneRepositoryFactory<
    ProjectNews,
    typeof Project.prototype.id
  >;

  public readonly logo: BelongsToAccessor<Media, typeof Project.prototype.id>;

  public readonly coverImage: BelongsToAccessor<
    Media,
    typeof Project.prototype.id
  >;

  public readonly images: HasManyThroughRepositoryFactory<
    Media,
    typeof Media.prototype.id,
    ProjectImage,
    typeof ProjectImage.prototype.id
  >;

  public readonly userEnquiries: HasManyRepositoryFactory<
    UserEnquiry,
    typeof Project.prototype.id
  >;

  public readonly userInvestments: HasManyRepositoryFactory<
    UserInvestment,
    typeof Project.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
    @repository.getter('ProjectNewsRepository')
    protected projectnewsRepositoryGetter: Getter<ProjectNewsRepository>,
    @repository.getter('CompanyRepository')
    protected companyRepositoryGetter: Getter<CompanyRepository>,
    @repository.getter('MediaRepository')
    protected mediaRepositoryGetter: Getter<MediaRepository>,
    @repository.getter('ProjectImageRepository')
    protected projectImageRepositoryGetter: Getter<ProjectImageRepository>,
    @repository('ProjectNewsRepository')
    protected projectNewsRepository: ProjectNewsRepository,
    @repository('ProjectDetailsRepository')
    protected projectDetailsRepository: ProjectDetailsRepository,
    @repository.getter('UserEnquiryRepository')
    protected userEnquiryRepositoryGetter: Getter<UserEnquiryRepository>,
    @repository.getter('UserInvestmentRepository')
    protected userInvestmentRepositoryGetter: Getter<UserInvestmentRepository>,
  ) {
    super(Project, dataSource);
    this.userInvestments = this.createHasManyRepositoryFactoryFor(
      'userInvestments',
      userInvestmentRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userInvestments',
      this.userInvestments.inclusionResolver,
    );

    this.newsId = this.createHasOneRepositoryFactoryFor(
      'newsId',
      projectnewsRepositoryGetter,
    );
    this.registerInclusionResolver('newsId', this.newsId.inclusionResolver);
    this.userEnquiries = this.createHasManyRepositoryFactoryFor(
      'userEnquiries',
      userEnquiryRepositoryGetter,
    );
    this.coverImage = this.createBelongsToAccessorFor(
      'coverImage',
      mediaRepositoryGetter,
    );
    this.registerInclusionResolver(
      'coverImage',
      this.coverImage.inclusionResolver,
    );
    this.logo = this.createBelongsToAccessorFor('logo', mediaRepositoryGetter);
    this.registerInclusionResolver('logo', this.logo.inclusionResolver);
    this.company = this.createBelongsToAccessorFor(
      'company',
      companyRepositoryGetter,
    );
    this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.investments = this.createHasManyRepositoryFactoryFor(
      'investments',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver(
      'investments',
      this.investments.inclusionResolver,
    );
    this.images = this.createHasManyThroughRepositoryFactoryFor(
      'images',
      mediaRepositoryGetter,
      projectImageRepositoryGetter,
    );
    this.registerInclusionResolver('images', this.images.inclusionResolver);
  }

  definePersistedModel(entityClass: typeof Project) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('loaded', async ctx => {
      if (ctx.data && ctx.data.id) {
        const totalInvestment = await this.execute(
          `SELECT SUM(amount) as "sum" FROM orders WHERE project_id=${ctx.data.id} AND status='${ORDERSTATUS.completed}';`,
        );
        ctx.data.totalInvestment = parseInt(totalInvestment[0].sum) || 0;
      }
    });
    return modelClass;
  }

  findProjectDetailByProjectId(id: number): Promise<ProjectDetails | null> {
    const projectDetail = this.projectDetailsRepository.findOne({
      where: {
        projectId: id,
      },
      fields: softExclude,
    });
    return projectDetail;
  }

  async createProjectAndDetail(
    project: Omit<Project, 'id'>,
    content: string,
  ): Promise<Project> {
    const newProject = await this.create({
      ...project,
      slug: Slug(project.name),
    });

    await this.projectDetailsRepository.create({
      projectId: newProject.id,
      content,
    });
    return newProject;
  }

  async updateProjectAndDetailsById(
    id: number,
    project: Omit<Project, 'id'>,
    content: string | null,
  ): Promise<void> {
    await this.updateById(id, {
      ...project,
      slug: Slug(project.name),
    });

    if (!content) return;
    const projectDetail: ProjectDetails | null =
      await this.projectDetailsRepository.findOne({
        where: {
          projectId: id,
        },
      });

    if (projectDetail)
      await this.projectDetailsRepository.updateById(projectDetail.id, {
        content,
      });

    if (!projectDetail)
      await this.projectDetailsRepository.create({
        content,
        projectId: id,
      });
  }

  async replaceProjectAndDetailsById(
    id: number,
    project: Omit<Project, 'id'>,
    content: string,
  ): Promise<void> {
    await this.replaceById(id, {
      ...project,
      slug: Slug(project.name),
    });

    const projectDetail: ProjectDetails | null =
      await this.projectDetailsRepository.findOne({
        where: {
          projectId: id,
        },
      });

    if (projectDetail)
      await this.projectDetailsRepository.updateById(projectDetail.id, {
        content,
      });

    if (!projectDetail)
      await this.projectDetailsRepository.create({
        content,
        projectId: id,
      });
  }

  async deleteProjectAndDetailsById(id: number) {
    await this.deleteById(id);

    const projectDetail: ProjectDetails | null =
      await this.projectDetailsRepository.findOne({
        where: {
          projectId: id,
        },
      });

    if (!projectDetail) return;
    await this.projectDetailsRepository.deleteById(projectDetail.id);
  }

  async findProjectNewsByProjectId(id: number): Promise<ProjectNews[]> {
    return this.projectNewsRepository.find({
      where: {
        projectId: id,
      },
      fields: softExclude,
    });
  }
}
