import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { User, UserCredentials, UserCredentialsRelations } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';
import { UserRepository } from './user.repository';

export class UserCredentialsRepository extends DefaultBaseEntityCrudRepository<UserCredentials,
    typeof UserCredentials.prototype.id,
    UserCredentialsRelations> {

  public readonly user: BelongsToAccessor<User, typeof UserCredentials.prototype.id>;

    constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
        super(UserCredentials, dataSource);
      this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
      this.registerInclusionResolver('user', this.user.inclusionResolver);
    }

}
