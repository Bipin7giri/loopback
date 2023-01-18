import {inject} from '@loopback/context';
import {DbDataSource} from '../datasources';
import {ProjectNews, ProjectNewsRelations} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';

export class ProjectNewsRepository extends DefaultBaseEntityCrudRepository<
  ProjectNews,
  typeof ProjectNews.prototype.id,
  ProjectNewsRelations
> {
  constructor(@inject('datasources.db') DbDataSource: DbDataSource) {
    super(ProjectNews, DbDataSource);
  }
}
