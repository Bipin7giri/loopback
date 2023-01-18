import {inject} from '@loopback/context';
import {DbDataSource} from '../datasources';
import {ProjectDetails, ProjectDetailsRelations} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';

export class ProjectDetailsRepository extends DefaultBaseEntityCrudRepository<
  ProjectDetails,
  typeof ProjectDetails.prototype.id,
  ProjectDetailsRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(ProjectDetails, dataSource);
  }
}
