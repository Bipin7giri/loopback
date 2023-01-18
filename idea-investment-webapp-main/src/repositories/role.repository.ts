import { inject } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { Role, RoleRelations } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';

export class RoleRepository extends DefaultBaseEntityCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Role, dataSource);
  }
}
