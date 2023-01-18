import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { User, UserFirebase, UserFirebaseRelations } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';
import { UserRepository } from './user.repository';

export class UserFirebaseRepository extends DefaultBaseEntityCrudRepository<
  UserFirebase,
  typeof UserFirebase.prototype.id,
  UserFirebaseRelations
> {

  public readonly user: BelongsToAccessor<User, typeof UserFirebase.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserFirebase, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
