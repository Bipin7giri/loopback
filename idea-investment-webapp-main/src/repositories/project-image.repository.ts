import {inject} from '@loopback/context';
import {DbDataSource} from '../datasources';
import {ProjectImage, ProjectImageRelations} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';

export class ProjectImageRepository extends DefaultBaseEntityCrudRepository<
  ProjectImage,
  typeof ProjectImage.prototype.id,
  ProjectImageRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(ProjectImage, dataSource);
  }
}
