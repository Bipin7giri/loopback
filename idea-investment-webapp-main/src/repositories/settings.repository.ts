import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Settings, SettingsRelations} from '../models';

export class SettingsRepository extends DefaultCrudRepository<
  Settings,
  typeof Settings.prototype.id,
  SettingsRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Settings, dataSource);
  }
}
