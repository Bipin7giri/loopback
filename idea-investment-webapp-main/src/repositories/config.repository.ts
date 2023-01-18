import { inject } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { Config, ConfigRelations } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';

export class ConfigRepository extends DefaultBaseEntityCrudRepository<
  Config,
  typeof Config.prototype.id,
  ConfigRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Config, dataSource);
  }
}
