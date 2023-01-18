import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Project, User, Wishlist, WishlistRelations } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';
import { ProjectRepository } from './project.repository';
import { UserRepository } from './user.repository';

export class WishlistRepository extends DefaultBaseEntityCrudRepository<
  Wishlist,
  typeof Wishlist.prototype.id,
  WishlistRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Wishlist.prototype.id>;

  public readonly project: BelongsToAccessor<Project, typeof Wishlist.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ProjectRepository') protected projectRepositoryGetter: Getter<ProjectRepository>,
  ) {
    super(Wishlist, dataSource);
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
