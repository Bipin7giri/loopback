import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';

export class CategoryRepository extends DefaultBaseEntityCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {

  public readonly parent: BelongsToAccessor<Category, typeof Category.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Category, dataSource);
    this.parent = this.createBelongsToAccessorFor('parent', categoryRepositoryGetter,);
    this.registerInclusionResolver('parent', this.parent.inclusionResolver);
  }
}
