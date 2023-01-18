import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Project, User, UserEnquiry, UserEnquiryRelations} from '../models';
import {ProjectRepository} from './project.repository';
import {UserRepository} from './user.repository';

export class UserEnquiryRepository extends DefaultCrudRepository<
  UserEnquiry,
  typeof UserEnquiry.prototype.id,
  UserEnquiryRelations
> {
  public readonly user: BelongsToAccessor<User, typeof UserEnquiry.prototype.id>;
  public readonly project: BelongsToAccessor<Project, typeof UserEnquiry.prototype.id>;
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('ProjectRepository')
    protected projectRepositoryGetter: Getter<ProjectRepository>,

  ) {
    super(UserEnquiry, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver)
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver)
  }
}
