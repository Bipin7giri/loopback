import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Role, User, UserRoles, UserRolesRelations } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';
import { RoleRepository } from './role.repository';
import { UserRepository } from './user.repository';

export class UserRolesRepository extends DefaultBaseEntityCrudRepository<
  UserRoles,
  typeof UserRoles.prototype.id,
  UserRolesRelations
> {

  public readonly role: BelongsToAccessor<Role, typeof UserRoles.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof UserRoles.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserRoles, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter,);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }
}
