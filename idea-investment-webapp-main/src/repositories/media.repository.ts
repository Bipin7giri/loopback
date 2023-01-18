import { inject, Getter} from '@loopback/core';
import { DbDataSource } from '../datasources';
import { Media, MediaRelations, User} from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {UserRepository} from './user.repository';

export class MediaRepository extends DefaultBaseEntityCrudRepository<
  Media,
  typeof Media.prototype.id,
  MediaRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Media.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Media, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
